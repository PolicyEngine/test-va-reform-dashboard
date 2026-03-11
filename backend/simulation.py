"""
Pure business logic for VA reform dashboard.
policyengine imports at module level — captured in the image snapshot
via .run_function(snapshot_models).
"""

from policyengine_us import Simulation, Microsimulation


def run_household(params: dict) -> dict:
    """
    Compute household-level tax and benefit results across a range of
    earnings levels for both baseline and reform scenarios.

    Uses the policyengine-us axes pattern to sweep employment_income
    in a single Simulation call.
    """
    # TODO: Implement
    # 1. Build household situation dict from params
    # 2. Build reform dict from params["reform"]
    # 3. Run baseline Simulation with axes over employment_income
    # 4. Run reform Simulation with axes over employment_income
    # 5. Extract variables and compute summary at user's income level
    raise NotImplementedError("Household simulation not yet implemented")


def run_statewide(params: dict) -> dict:
    """
    Run microsimulation comparing baseline to reform for Virginia
    residents using the Enhanced CPS dataset.

    Returns aggregate revenue change, winner/loser counts, poverty
    impact, and decile-level average income changes.
    """
    # TODO: Implement
    # 1. Build reform dict from params["reform"]
    # 2. Run baseline Microsimulation
    # 3. Run reform Microsimulation
    # 4. Filter to Virginia residents
    # 5. Compute revenue change, winners/losers, poverty, deciles
    raise NotImplementedError(
        "Statewide microsimulation not yet implemented"
    )
