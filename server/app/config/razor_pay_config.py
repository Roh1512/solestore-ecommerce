'''Razor pay config'''

import razorpay
from app.config.env_settings import settings

razorpay_client = razorpay.Client(
    # type: ignore[attr-defined]
    auth=(settings.RAZOR_PAY_API_KEY, settings.RAZOR_PAY_API_SECRET))
