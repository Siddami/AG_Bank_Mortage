const purchasePriceText = document.getElementById("purchase-price-text");
const purchasePriceSlider = document.getElementById("purchase-price-slider");
const downPaymentText = document.getElementById("down-payment-text");
const downPaymentSlider = document.getElementById("down-payment-slider");
const periodInputs = document.querySelectorAll('input[name="period"]');
const zipCodeInput = document.getElementById("zip-code");

const paymentAmountElement = document.querySelector(".payment-amount");
const rateValueElement = document.querySelector(
  ".rate-details .detail-item:nth-child(1) .value"
);
const aprValueElement = document.querySelector(
  ".rate-details .detail-item:nth-child(2) .value"
);
const pointsValueElement = document.querySelector(
  ".rate-details .detail-item:nth-child(3) .value"
);

purchasePriceSlider.addEventListener("input", () => {
  purchasePriceText.value = purchasePriceSlider.value;
  updateCalculator();
});

purchasePriceText.addEventListener("change", () => {
  // Ensure the text value is within the slider's min/max bounds
  let val = parseInt(purchasePriceText.value);
  val = Math.max(val, 50000);
  val = Math.min(val, 2500000);
  purchasePriceText.value = val;
  purchasePriceSlider.value = val;
  updateCalculator();
});

downPaymentSlider.addEventListener("input", () => {
  downPaymentText.value = downPaymentSlider.value;
  updateCalculator();
});

downPaymentText.addEventListener("change", () => {
  const purchasePrice = parseFloat(purchasePriceText.value);
  let downPaymentValue = parseFloat(downPaymentText.value);
  const minDownPayment = Math.max(2000, purchasePrice * 0.04);
  downPaymentValue = Math.max(downPaymentValue, minDownPayment);
  downPaymentText.value = downPaymentValue;
  downPaymentSlider.value = downPaymentValue;
  updateCalculator();
});

// --- PLACEHOLDER DATA (will be replacing with backend api data later)
const RATES = {
  "5/1 arm variable": { rate: 6.1, apr: 6.25, points: 0.125 },
  "15 year fixed": { rate: 5.5, apr: 5.65, points: 0.25 },
  "30 year fixed": { rate: 5.25, apr: 5.418, points: 0.325 },
};

// Simple placeholder estimates for Property Tax, and Insurance
const EST_TAX_RATE = 0.008; // 0.8% of home value annually
const EST_INSURANCE_MONTHLY = 100; // $100 per month

/**
 * Calculates the monthly principal and interest (P&I) payment.
 *  P - Principal (Loan Amount)
 * i - Monthly interest rate (decimal)
 *  n - Total number of payments
 */

function calculateMonthlyPayment(P, i, n) {
  if (i === 0) return P / n;
  return (P * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
}

function updateCalculator() {
  const purchasePrice = parseFloat(purchasePriceText.value) || 0;
  const downPayment = parseFloat(downPaymentText.value) || 0;
  const loanAmount = purchasePrice - downPayment;

  const selectedPeriod = document.querySelector(
    'input[name="period"]:checked'
  ).value;
  const loanDetails = RATES[selectedPeriod];

  const termYears = selectedPeriod.includes("15")
    ? 15
    : selectedPeriod.includes("30")
    ? 30
    : 30; // 5/1 ARM uses 30 years for amortization
  const n = termYears * 12;

  const annualRate = loanDetails.rate / 100;
  const i = annualRate / 12;

  const PI = calculateMonthlyPayment(loanAmount, i, n);

  const monthlyTaxes = (purchasePrice * EST_TAX_RATE) / 12;

  const monthlyInsurance = EST_INSURANCE_MONTHLY;

  const totalPayment = PI + monthlyTaxes + monthlyInsurance;

  paymentAmountElement.textContent =
    Math.round(totalPayment).toLocaleString("en-US");

  rateValueElement.textContent = loanDetails.rate.toFixed(3) + "%";
  aprValueElement.textContent = loanDetails.apr.toFixed(3) + "%";
  pointsValueElement.textContent = loanDetails.points.toFixed(3);

  updateSliderBackgrounds();
}

periodInputs.forEach((input) => {
  input.addEventListener("change", updateCalculator);
});

zipCodeInput.addEventListener("input", updateCalculator);

document.addEventListener("DOMContentLoaded", updateCalculator);

function updateSliderBackgrounds() {
  [
    { slider: purchasePriceSlider, text: purchasePriceText },
    { slider: downPaymentSlider, text: downPaymentText },
  ].forEach(({ slider, text }) => {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(text.value);

    const percentage = ((val - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${percentage}%, var(--slider-track-gray) ${percentage}%, var(--slider-track-gray) 100%)`;
  });
}
