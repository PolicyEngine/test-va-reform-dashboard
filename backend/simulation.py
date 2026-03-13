"""
VA Reform Dashboard — simulation logic.

Pure business logic with policyengine imports at module level (snapshotted
into the Modal image at build time via _image_setup.py).
"""

from __future__ import annotations

import bisect
import hashlib
import json
import logging
from typing import Optional

import numpy as np
from pydantic import BaseModel
from policyengine_us import Simulation, Microsimulation
from policyengine_core.reforms import Reform

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic models (shared with gateway via dict serialization)
# ---------------------------------------------------------------------------


class ReformParams(BaseModel):
    # Federal income tax bracket rates (7 brackets)
    federal_bracket_rates: list[float] = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37]
    # Federal CTC
    federal_ctc_amount: float = 2200
    federal_ctc_phase_out_threshold_single: float = 200000
    federal_ctc_phase_out_threshold_joint: float = 400000
    federal_ctc_refundable_max: float = 1700
    federal_ctc_fully_refundable: bool = False
    # Federal EITC max amounts by number of children
    federal_eitc_max_0: float = 664
    federal_eitc_max_1: float = 4427
    federal_eitc_max_2: float = 7316
    federal_eitc_max_3: float = 8231
    # Virginia income tax rates (4 brackets)
    va_rate_1: float = 0.02
    va_rate_2: float = 0.03
    va_rate_3: float = 0.05
    va_rate_4: float = 0.0575
    va_standard_deduction: Optional[float] = None
    # Virginia EITC
    va_eitc_match_rate: float = 0.20


class HouseholdImpactRequest(BaseModel):
    filing_status: str = "single"
    head_age: int = 40
    spouse_age: Optional[int] = 40
    dependent_ages: list[int] = []
    income: float = 50000
    reform: ReformParams = ReformParams()


class StatewideImpactRequest(BaseModel):
    reform: ReformParams = ReformParams()


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

YEAR = 2026
NUM_POINTS = 101
MAX_EARNINGS = 500_000
EARNINGS_AXIS = [round(i * MAX_EARNINGS / (NUM_POINTS - 1)) for i in range(NUM_POINTS)]

FILING_STATUS_MAP = {
    "single": "SINGLE",
    "joint": "JOINT",
    "head_of_household": "HEAD_OF_HOUSEHOLD",
}

# Federal income tax bracket rate parameter paths (7 brackets, 1-indexed keys in YAML)
FEDERAL_BRACKET_RATE_PATHS = [
    f"gov.irs.income.bracket.rates.{i}" for i in range(1, 8)
]

# Federal CTC parameter paths
FEDERAL_CTC_AMOUNT_PATH = "gov.irs.credits.ctc.amount.base[0].amount"
FEDERAL_CTC_PHASE_OUT_THRESHOLD_PATH = "gov.irs.credits.ctc.phase_out.threshold"
FEDERAL_CTC_REFUNDABLE_MAX_PATH = "gov.irs.credits.ctc.refundable.individual_max"
FEDERAL_CTC_FULLY_REFUNDABLE_PATH = "gov.irs.credits.ctc.refundable.fully_refundable"

# Federal EITC max parameter paths (bracket scale, 0-indexed, needs .amount sub-key)
FEDERAL_EITC_MAX_PATHS = [
    f"gov.irs.credits.eitc.max[{i}].amount" for i in range(4)
]

# Virginia income tax rate parameter paths (bracket scale, 0-indexed, needs .rate sub-key)
VA_RATE_PATHS = [
    f"gov.states.va.tax.income.rates[{i}].rate" for i in range(4)
]

# Virginia standard deduction
VA_STANDARD_DEDUCTION_PATH = "gov.states.va.tax.income.deductions.standard"

# Virginia EITC match rates
VA_EITC_REFUNDABLE_PATH = "gov.states.va.tax.income.credits.eitc.match.refundable"
VA_EITC_NON_REFUNDABLE_PATH = (
    "gov.states.va.tax.income.credits.eitc.match.non_refundable"
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def build_situation(
    filing_status: str,
    head_age: int,
    spouse_age: int | None,
    dependent_ages: list[int],
    income: float,
) -> dict:
    """Build a policyengine-us situation dict for a Virginia household."""
    pe_filing_status = FILING_STATUS_MAP.get(filing_status, "SINGLE")
    is_joint = filing_status == "joint"

    people = {}
    members = []

    people["head"] = {
        "age": {str(YEAR): head_age},
        "employment_income": {str(YEAR): income},
        "is_tax_unit_head": {str(YEAR): True},
    }
    members.append("head")

    if is_joint and spouse_age is not None:
        people["spouse"] = {
            "age": {str(YEAR): spouse_age},
            "employment_income": {str(YEAR): 0},
            "is_tax_unit_spouse": {str(YEAR): True},
        }
        members.append("spouse")

    for i, age in enumerate(dependent_ages):
        dep_name = f"dependent_{i}"
        people[dep_name] = {
            "age": {str(YEAR): age},
            "is_tax_unit_dependent": {str(YEAR): True},
        }
        members.append(dep_name)

    situation = {
        "people": people,
        "tax_units": {
            "tax_unit": {
                "members": members,
                "filing_status": {str(YEAR): pe_filing_status},
            }
        },
        "families": {"family": {"members": members}},
        "spm_units": {"spm_unit": {"members": members}},
        "marital_units": {},
        "households": {
            "household": {
                "members": members,
                "state_code": {str(YEAR): "VA"},
            }
        },
    }

    # Build marital units
    if is_joint and spouse_age is not None:
        situation["marital_units"]["marital_unit"] = {
            "members": ["head", "spouse"],
        }
    else:
        situation["marital_units"]["marital_unit"] = {
            "members": ["head"],
        }
    for i in range(len(dependent_ages)):
        dep_name = f"dependent_{i}"
        situation["marital_units"][f"marital_unit_{dep_name}"] = {
            "members": [dep_name],
        }

    return situation


def build_axes_situation(
    filing_status: str,
    head_age: int,
    spouse_age: int | None,
    dependent_ages: list[int],
) -> dict:
    """Build situation with axes sweep over employment_income."""
    situation = build_situation(
        filing_status, head_age, spouse_age, dependent_ages, income=0
    )
    situation["axes"] = [
        [
            {
                "name": "employment_income",
                "min": 0,
                "max": MAX_EARNINGS,
                "count": NUM_POINTS,
                "period": str(YEAR),
            }
        ]
    ]
    return situation


def build_reform_object(reform_params: ReformParams) -> Reform:
    """Convert ReformParams into a policyengine Reform object."""
    period_key = f"{YEAR}-01-01.2100-12-31"
    reform_dict = {}

    # Federal income tax bracket rates
    for i, path in enumerate(FEDERAL_BRACKET_RATE_PATHS):
        reform_dict[path] = {period_key: reform_params.federal_bracket_rates[i]}

    # Federal CTC amount
    reform_dict[FEDERAL_CTC_AMOUNT_PATH] = {
        period_key: reform_params.federal_ctc_amount
    }

    # Federal CTC phase-out thresholds (filing-status-indexed)
    # SINGLE and HEAD_OF_HOUSEHOLD use the single threshold;
    # JOINT and SURVIVING_SPOUSE use the joint threshold
    reform_dict[f"{FEDERAL_CTC_PHASE_OUT_THRESHOLD_PATH}.SINGLE"] = {
        period_key: reform_params.federal_ctc_phase_out_threshold_single
    }
    reform_dict[f"{FEDERAL_CTC_PHASE_OUT_THRESHOLD_PATH}.HEAD_OF_HOUSEHOLD"] = {
        period_key: reform_params.federal_ctc_phase_out_threshold_single
    }
    reform_dict[f"{FEDERAL_CTC_PHASE_OUT_THRESHOLD_PATH}.JOINT"] = {
        period_key: reform_params.federal_ctc_phase_out_threshold_joint
    }
    reform_dict[f"{FEDERAL_CTC_PHASE_OUT_THRESHOLD_PATH}.SURVIVING_SPOUSE"] = {
        period_key: reform_params.federal_ctc_phase_out_threshold_joint
    }
    reform_dict[f"{FEDERAL_CTC_PHASE_OUT_THRESHOLD_PATH}.SEPARATE"] = {
        period_key: reform_params.federal_ctc_phase_out_threshold_single
    }

    # Federal CTC refundable max
    reform_dict[FEDERAL_CTC_REFUNDABLE_MAX_PATH] = {
        period_key: reform_params.federal_ctc_refundable_max
    }

    # Federal CTC fully refundable
    reform_dict[FEDERAL_CTC_FULLY_REFUNDABLE_PATH] = {
        period_key: reform_params.federal_ctc_fully_refundable
    }

    # Federal EITC max amounts
    eitc_maxes = [
        reform_params.federal_eitc_max_0,
        reform_params.federal_eitc_max_1,
        reform_params.federal_eitc_max_2,
        reform_params.federal_eitc_max_3,
    ]
    for i, path in enumerate(FEDERAL_EITC_MAX_PATHS):
        reform_dict[path] = {period_key: eitc_maxes[i]}

    # Virginia income tax rates
    va_rates = [
        reform_params.va_rate_1,
        reform_params.va_rate_2,
        reform_params.va_rate_3,
        reform_params.va_rate_4,
    ]
    for i, path in enumerate(VA_RATE_PATHS):
        reform_dict[path] = {period_key: va_rates[i]}

    # Virginia standard deduction (filing-status-indexed)
    if reform_params.va_standard_deduction is not None:
        for fs in ["SINGLE", "JOINT", "SEPARATE", "HEAD_OF_HOUSEHOLD", "SURVIVING_SPOUSE"]:
            reform_dict[f"{VA_STANDARD_DEDUCTION_PATH}.{fs}"] = {
                period_key: reform_params.va_standard_deduction
            }

    # Virginia EITC match rates (both refundable and non-refundable)
    reform_dict[VA_EITC_REFUNDABLE_PATH] = {
        period_key: reform_params.va_eitc_match_rate
    }
    reform_dict[VA_EITC_NON_REFUNDABLE_PATH] = {
        period_key: reform_params.va_eitc_match_rate
    }

    return Reform.from_dict(reform_dict, "policyengine_us")


def run_household_sim(situation: dict, reform_params: ReformParams | None):
    """Run a single household simulation and return variable arrays."""
    if reform_params is not None:
        reform_obj = build_reform_object(reform_params)
        sim = Simulation(situation=situation, reform=reform_obj)
    else:
        sim = Simulation(situation=situation)

    net_income = sim.calculate("household_net_income", YEAR).tolist()
    federal_tax = sim.calculate("income_tax", YEAR).tolist()
    state_tax = sim.calculate("state_income_tax", YEAR).tolist()
    eitc = sim.calculate("eitc", YEAR).tolist()
    ctc = sim.calculate("ctc", YEAR).tolist()

    return {
        "net_income": net_income,
        "federal_tax": federal_tax,
        "state_tax": state_tax,
        "eitc": eitc,
        "ctc": ctc,
    }


def compute_mtr(net_incomes: list[float], earnings: list[float]) -> list[float]:
    """Compute marginal tax rates from net income and earnings arrays."""
    mtrs = []
    for i in range(len(earnings)):
        if i == 0:
            if len(earnings) > 1 and earnings[1] != earnings[0]:
                delta_earnings = earnings[1] - earnings[0]
                delta_net = net_incomes[1] - net_incomes[0]
                mtrs.append(round(1 - delta_net / delta_earnings, 4))
            else:
                mtrs.append(0.0)
        else:
            delta_earnings = earnings[i] - earnings[i - 1]
            if delta_earnings == 0:
                mtrs.append(mtrs[-1] if mtrs else 0.0)
            else:
                delta_net = net_incomes[i] - net_incomes[i - 1]
                mtrs.append(round(1 - delta_net / delta_earnings, 4))
    return mtrs


def find_index_at_income(income: float, earnings: list[float]) -> int:
    """Find the nearest index in the earnings axis for a given income."""
    idx = bisect.bisect_left(earnings, income)
    if idx >= len(earnings):
        idx = len(earnings) - 1
    elif idx > 0 and abs(earnings[idx - 1] - income) < abs(earnings[idx] - income):
        idx -= 1
    return idx


def reform_hash(reform_params: ReformParams) -> str:
    """Create a hash key for caching microsimulation results."""
    return hashlib.md5(
        json.dumps(reform_params.model_dump(), sort_keys=True).encode()
    ).hexdigest()


# ---------------------------------------------------------------------------
# Entry-point functions (called by app.py worker wrappers)
# ---------------------------------------------------------------------------


def run_household(params: dict) -> dict:
    """Compute household-level tax/benefit results across earnings levels.

    Uses the policyengine-us axes pattern to sweep employment_income from
    $0 to $500k in a single Simulation call for both baseline and reform.
    """
    req = HouseholdImpactRequest(**params)

    situation = build_axes_situation(
        filing_status=req.filing_status,
        head_age=req.head_age,
        spouse_age=req.spouse_age if req.filing_status == "joint" else None,
        dependent_ages=req.dependent_ages,
    )

    # Run baseline (no reform)
    baseline = run_household_sim(situation, reform_params=None)
    # Run reform
    reform = run_household_sim(situation, reform_params=req.reform)

    # Compute marginal tax rates
    baseline_mtr = compute_mtr(baseline["net_income"], EARNINGS_AXIS)
    reform_mtr = compute_mtr(reform["net_income"], EARNINGS_AXIS)

    # Find summary at user's specific income
    idx = find_index_at_income(req.income, EARNINGS_AXIS)

    summary = {
        "baseline_federal_tax": round(float(baseline["federal_tax"][idx]), 2),
        "reform_federal_tax": round(float(reform["federal_tax"][idx]), 2),
        "baseline_state_tax": round(float(baseline["state_tax"][idx]), 2),
        "reform_state_tax": round(float(reform["state_tax"][idx]), 2),
        "baseline_ctc": round(float(baseline["ctc"][idx]), 2),
        "reform_ctc": round(float(reform["ctc"][idx]), 2),
        "baseline_eitc": round(float(baseline["eitc"][idx]), 2),
        "reform_eitc": round(float(reform["eitc"][idx]), 2),
        "baseline_net_income": round(float(baseline["net_income"][idx]), 2),
        "reform_net_income": round(float(reform["net_income"][idx]), 2),
        "net_change": round(
            float(reform["net_income"][idx]) - float(baseline["net_income"][idx]), 2
        ),
    }

    return {
        "earnings_axis": EARNINGS_AXIS,
        "baseline_net_income": [round(float(v), 2) for v in baseline["net_income"]],
        "reform_net_income": [round(float(v), 2) for v in reform["net_income"]],
        "baseline_federal_tax": [round(float(v), 2) for v in baseline["federal_tax"]],
        "reform_federal_tax": [round(float(v), 2) for v in reform["federal_tax"]],
        "baseline_state_tax": [round(float(v), 2) for v in baseline["state_tax"]],
        "reform_state_tax": [round(float(v), 2) for v in reform["state_tax"]],
        "baseline_eitc": [round(float(v), 2) for v in baseline["eitc"]],
        "reform_eitc": [round(float(v), 2) for v in reform["eitc"]],
        "baseline_ctc": [round(float(v), 2) for v in baseline["ctc"]],
        "reform_ctc": [round(float(v), 2) for v in reform["ctc"]],
        "baseline_mtr": baseline_mtr,
        "reform_mtr": reform_mtr,
        "summary": summary,
    }


def run_statewide(params: dict) -> dict:
    """Run microsimulation comparing baseline to reform for Virginia residents.

    Uses the Enhanced CPS dataset. Returns aggregate revenue change,
    winner/loser counts, poverty impact, and decile-level average income changes.
    """
    req = StatewideImpactRequest(**params)
    reform_obj = build_reform_object(req.reform)

    logger.info("Starting baseline microsimulation...")
    baseline = Microsimulation()

    # Extract baseline values — map household-level variables to person level
    baseline_net = baseline.calc(
        "household_net_income", period=YEAR, map_to="person"
    ).values
    baseline_fed_tax = baseline.calc(
        "income_tax", period=YEAR, map_to="person"
    ).values
    baseline_state_tax = baseline.calc(
        "state_income_tax", period=YEAR, map_to="person"
    ).values
    baseline_person_weight = baseline.calc("person_weight", period=YEAR).values
    baseline_poverty = baseline.calc(
        "in_poverty", period=YEAR, map_to="person"
    ).values
    baseline_is_child = baseline.calc("is_child", period=YEAR).values
    baseline_decile = baseline.calc(
        "household_income_decile", period=YEAR, map_to="person"
    ).values
    baseline_state_code = baseline.calc(
        "state_code_str", period=YEAR, map_to="person"
    ).values

    logger.info("Starting reform microsimulation...")
    reform_sim = Microsimulation(reform=reform_obj)

    reform_net = reform_sim.calc(
        "household_net_income", period=YEAR, map_to="person"
    ).values
    reform_fed_tax = reform_sim.calc(
        "income_tax", period=YEAR, map_to="person"
    ).values
    reform_state_tax = reform_sim.calc(
        "state_income_tax", period=YEAR, map_to="person"
    ).values
    reform_poverty = reform_sim.calc(
        "in_poverty", period=YEAR, map_to="person"
    ).values

    # Filter to Virginia residents
    va_mask = baseline_state_code == "VA"
    logger.info(
        f"Virginia residents: {int(np.sum(baseline_person_weight[va_mask])):,}"
    )

    va_weights = baseline_person_weight[va_mask]
    va_baseline_net = baseline_net[va_mask]
    va_reform_net = reform_net[va_mask]
    va_baseline_fed_tax = baseline_fed_tax[va_mask]
    va_reform_fed_tax = reform_fed_tax[va_mask]
    va_baseline_state_tax = baseline_state_tax[va_mask]
    va_reform_state_tax = reform_state_tax[va_mask]
    va_baseline_poverty = baseline_poverty[va_mask]
    va_reform_poverty = reform_poverty[va_mask]
    va_is_child = baseline_is_child[va_mask]
    va_decile = baseline_decile[va_mask]

    # Revenue changes
    federal_revenue_change = float(
        np.sum((va_reform_fed_tax - va_baseline_fed_tax) * va_weights)
    )
    state_revenue_change = float(
        np.sum((va_reform_state_tax - va_baseline_state_tax) * va_weights)
    )
    total_cost = federal_revenue_change + state_revenue_change

    # Winners / losers / unchanged
    net_diff = va_reform_net - va_baseline_net
    winners = int(np.sum(va_weights[net_diff > 1]))
    losers = int(np.sum(va_weights[net_diff < -1]))
    unchanged = int(np.sum(va_weights[np.abs(net_diff) <= 1]))

    # Poverty rate change
    baseline_poverty_rate = float(np.average(va_baseline_poverty, weights=va_weights))
    reform_poverty_rate = float(np.average(va_reform_poverty, weights=va_weights))
    poverty_rate_change = round(reform_poverty_rate - baseline_poverty_rate, 4)

    # Child poverty rate change
    child_mask = va_is_child > 0
    if child_mask.sum() > 0:
        child_weights = va_weights[child_mask]
        bl_child_pov = float(
            np.average(va_baseline_poverty[child_mask], weights=child_weights)
        )
        rf_child_pov = float(
            np.average(va_reform_poverty[child_mask], weights=child_weights)
        )
        child_poverty_rate_change = round(rf_child_pov - bl_child_pov, 4)
    else:
        child_poverty_rate_change = 0.0

    # Decile impacts
    decile_impacts = []
    for d in range(1, 11):
        mask = va_decile == d
        if mask.sum() > 0:
            weights_d = va_weights[mask]
            diff_d = net_diff[mask]
            avg_change = float(np.average(diff_d, weights=weights_d))
            bl_avg = float(np.average(va_baseline_net[mask], weights=weights_d))
            pct = avg_change / bl_avg if bl_avg != 0 else 0.0
            decile_impacts.append(
                {
                    "decile": d,
                    "avg_income_change": round(avg_change, 2),
                    "pct_change": round(pct, 6),
                }
            )
        else:
            decile_impacts.append(
                {"decile": d, "avg_income_change": 0, "pct_change": 0}
            )

    logger.info("Microsimulation complete.")

    return {
        "federal_revenue_change": round(federal_revenue_change, 2),
        "state_revenue_change": round(state_revenue_change, 2),
        "total_cost": round(total_cost, 2),
        "winners": winners,
        "losers": losers,
        "unchanged": unchanged,
        "poverty_rate_change": poverty_rate_change,
        "child_poverty_rate_change": child_poverty_rate_change,
        "decile_impacts": decile_impacts,
    }
