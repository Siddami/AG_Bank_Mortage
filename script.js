// --- 1. Get Input Elements ---
const purchasePriceText = document.getElementById("purchase-price-text");
const purchasePriceSlider = document.getElementById("purchase-price-slider");
const downPaymentText = document.getElementById("down-payment-text");
const downPaymentSlider = document.getElementById("down-payment-slider");

const periodInputs = document.querySelectorAll('input[name="period"]');
const zipCodeInput = document.getElementById("zip-code");

// --- 2. Get Output Elements ---
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

// Sync Price
purchasePriceSlider.addEventListener("input", () => {
  purchasePriceText.value = purchasePriceSlider.value;
  updateCalculator(); // Trigger main calculation
});

// Sync Price
purchasePriceText.addEventListener("change", () => {
  // Ensure the text value is within the slider min/max bounds
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
  let val = parseInt(purchasePriceText.value);
  val = Math.max(val, 50000);
  val = Math.min(val, 2500000);
  downPaymentText.value = val;
  downPaymentSlider.value = val;
  updateCalculator();
});

// --- PLACEHOLDER DATA (will be replacing with backend api data later)
const RATES = {
  "5/1 arm variable": { rate: 6.1, apr: 6.25, points: 0.125 },
  "15 year fixed": { rate: 5.5, apr: 5.65, points: 0.25 },
  "30 year fixed": { rate: 5.25, apr: 5.418, points: 0.325 },
};

// Simple placeholder estimates for PITI components
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

//Mainfunction to gather all inputs and update the display.

function updateCalculator() {
  // 1. INPUTS
  const purchasePrice = parseFloat(purchasePriceText.value) || 0;
  const downPayment = parseFloat(downPaymentText.value) || 0;
  const loanAmount = purchasePrice - downPayment;

  // Determine selected loan type
  const selectedPeriod = document.querySelector(
    'input[name="period"]:checked'
  ).value;
  const loanDetails = RATES[selectedPeriod];

  // Determine loan term (in years) and total payments (n)
  const termYears = selectedPeriod.includes("15")
    ? 15
    : selectedPeriod.includes("30")
    ? 30
    : 30; // 5/1 ARM uses 30 years for amortization
  const n = termYears * 12;

  // Determine monthly interest rate (i)
  const annualRate = loanDetails.rate / 100;
  const i = annualRate / 12;

  // 2. CALCULATE COMPONENTS

  // Calculate P&I
  const PI = calculateMonthlyPayment(loanAmount, i, n);

  // Estimate Taxes (Prorated monthly)
  const monthlyTaxes = (purchasePrice * EST_TAX_RATE) / 12;

  // Estimate Insurance
  const monthlyInsurance = EST_INSURANCE_MONTHLY;

  // Total PITI Payment
  const totalPayment = PI + monthlyTaxes + monthlyInsurance;

  // 3. UPDATE OUTPUT CARD

  // Update the large payment amount (round to nearest whole dollar for display)
  paymentAmountElement.textContent =
    Math.round(totalPayment).toLocaleString("en-US");

  // Update the Rate, APR, and Points
  rateValueElement.textContent = loanDetails.rate.toFixed(3) + "%";
  aprValueElement.textContent = loanDetails.apr.toFixed(3) + "%";
  pointsValueElement.textContent = loanDetails.points.toFixed(3);

  // Call function to update slider look (see section 4)
  updateSliderBackgrounds();
}

// 1. Attach to Period radio buttons
periodInputs.forEach((input) => {
  input.addEventListener("change", updateCalculator);
});

// 2. Attach to Zip Code
zipCodeInput.addEventListener("input", updateCalculator);

// 3. The Price and Down Payment inputs already trigger the update 

// Initialize the calculator on page load to show the default $780 payment
document.addEventListener("DOMContentLoaded", updateCalculator);

function updateSliderBackgrounds() {
  [
    { slider: purchasePriceSlider, text: purchasePriceText },
    { slider: downPaymentSlider, text: downPaymentText },
  ].forEach(({ slider, text }) => {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(text.value);

    // Calculate the percentage position of the current value
    const percentage = ((val - min) / (max - min)) * 100;

    // Apply the gradient: blue from 0% to the percentage, gray from percentage to 100%
    slider.style.background = `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${percentage}%, var(--slider-track-gray) ${percentage}%, var(--slider-track-gray) 100%)`;
  });
}
