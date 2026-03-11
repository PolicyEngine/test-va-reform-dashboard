"""
Backend simulation tests.
These require policyengine-us to be installed and will be skipped
in CI unless the backend test environment is configured.
"""

import pytest


@pytest.mark.skip(
    reason="Requires policyengine-us — run with `make test-backend`"
)
def test_household_baseline_returns_dict():
    """Household endpoint with default params should return a dict."""
    from simulation import run_household

    # TODO: Implement once simulation.py is complete
    pass


@pytest.mark.skip(
    reason="Requires policyengine-us — run with `make test-backend`"
)
def test_statewide_baseline_returns_dict():
    """Statewide endpoint with default params should return a dict."""
    from simulation import run_statewide

    # TODO: Implement once simulation.py is complete
    pass
