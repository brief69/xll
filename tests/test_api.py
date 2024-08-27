import pytest
from app.price_fetcher import get_asset_price

@pytest.mark.asyncio
async def test_xll_calculation():
    # USD test case
    usd_result = await get_asset_price("currency", "USD")
    assert usd_result["xll_value"] == pytest.approx(100 / usd_result["price"])

    # BTC test case
    btc_result = await get_asset_price("crypto", "bitcoin")
    assert btc_result["xll_value"] == pytest.approx(100 / btc_result["price"])