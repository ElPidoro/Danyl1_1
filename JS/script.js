const cartPrices = [150, 0, 45, 320, 0, 85];
let totalCheck = 0;
let bonusDiscount = 0;
let finalToPay = 0;
let cashReceived = 0;

const banknoteDenominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];

window.onload = function() {
  initCartDisplay();
};

function initCartDisplay() {
  const chipsContainer = document.getElementById('cartChips');
  if (!chipsContainer) return;

  chipsContainer.innerHTML = '';
  for (let i = 0; i < cartPrices.length; i++) {
    const isPromo = cartPrices[i] === 0;
    const chip = document.createElement('span');
    chip.className = isPromo
      ? 'px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold'
      : 'px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold';
    chip.textContent = isPromo ? '0 грн (Подарунок)' : cartPrices[i] + ' грн';
    chipsContainer.appendChild(chip);
  }
}

function calculateCart() {
  totalCheck = 0;
  const receiptItems = document.getElementById('receiptItems');
  receiptItems.innerHTML = '';

  for (let i = 0; i < cartPrices.length; i++) {
    if (cartPrices[i] === 0) {
      continue;
    }

    const itemWithVat = cartPrices[i] * 1.2;
    totalCheck += itemWithVat;

    const row = document.createElement('div');
    row.className = 'flex justify-between';

    const titleSpan = document.createElement('span');
    titleSpan.textContent = 'Товар #' + (i + 1) + ' (+ПДВ 20%):';

    const priceSpan = document.createElement('span');
    priceSpan.textContent = itemWithVat.toFixed(2) + ' грн';

    row.appendChild(titleSpan);
    row.appendChild(priceSpan);
    receiptItems.appendChild(row);
  }

  totalCheck = Number(totalCheck.toFixed(2));
  finalToPay = totalCheck;

  document.getElementById('receiptRawTotal').textContent = totalCheck.toFixed(2) + ' грн';
  document.getElementById('receiptToPay').textContent = finalToPay.toFixed(2) + ' грн';

  console.log('=== ЕТАП 1: ЧЕК ===');
  console.log('Сума чека з ПДВ: ' + totalCheck.toFixed(2) + ' грн');

  document.getElementById('btnApplyBonuses').disabled = false;
}

function validatePromoCode() {
  const promoInput = document.getElementById('promoCodeInput');
  const promoMsg = document.getElementById('promoValidationMsg');
  const scannedCoupon = promoInput ? promoInput.value.trim() : '';

  let digitsCount = 0;
  let latinLettersCount = 0;
  let isCouponValid = true;

  if (scannedCoupon.length === 0) {
    if (promoMsg) {
      promoMsg.className = 'text-xs text-red-500 font-bold mt-2';
      promoMsg.textContent = 'Помилка: поле промокоду не може бути порожнім!';
    }
    console.log('Помилка: введено порожній промокод!');
    return;
  }

  for (const char of scannedCoupon) {
    if (char === '-') {
      continue;
    }

    const isDigit = char >= '0' && char <= '9';
    const isUpperLetter = char >= 'A' && char <= 'Z';
    const isLowerLetter = char >= 'a' && char <= 'z';

    if (isDigit) {
      digitsCount++;
    } else if (isUpperLetter || isLowerLetter) {
      latinLettersCount++;
    } else {
      isCouponValid = false;
      break;
    }
  }

  console.log('=== ЕТАП 2: ВАЛІДАЦІЯ ПРОМОКОДУ ===');
  if (isCouponValid) {
    console.log('Купон ' + scannedCoupon + ' прийнято! Літер: ' + latinLettersCount + ', цифр: ' + digitsCount);
    if (promoMsg) {
      promoMsg.className = 'text-xs text-emerald-600 font-bold mt-2';
      promoMsg.textContent = 'Купон прийнято: ' + latinLettersCount + ' літер, ' + digitsCount + ' цифр.';
    }
  } else {
    console.log('Помилка зчитування купона ' + scannedCoupon + '!');
    if (promoMsg) {
      promoMsg.className = 'text-xs text-red-500 font-bold mt-2';
      promoMsg.textContent = 'Помилка: дозволені лише латинські літери, цифри та дефіс!';
    }
  }
}

function applyBonuses() {
  const balanceInput = document.getElementById('bonusBalanceInput');
  let bonusBalance = Number(balanceInput.value);
  const bonusStep = 50;
  const maxDiscountLimit = totalCheck * 0.5;
  bonusDiscount = 0;

  const stepsContainer = document.getElementById('bonusStepsContainer');
  stepsContainer.innerHTML = '';
  stepsContainer.classList.remove('hidden');

  while (bonusBalance >= bonusStep && (bonusDiscount + bonusStep) <= maxDiscountLimit) {
    bonusBalance -= bonusStep;
    bonusDiscount += bonusStep;

    const stepInfo = document.createElement('p');
    stepInfo.textContent = '✓ Списано ' + bonusStep + ' балів. Загальна знижка: ' + bonusDiscount + ' грн. Баланс: ' + bonusBalance;
    stepsContainer.appendChild(stepInfo);
  }

  finalToPay = Number((totalCheck - bonusDiscount).toFixed(2));

  balanceInput.value = bonusBalance;
  document.getElementById('receiptDiscount').textContent = '-' + bonusDiscount.toFixed(2) + ' грн';
  document.getElementById('receiptToPay').textContent = finalToPay.toFixed(2) + ' грн';

  console.log('=== ЕТАП 3: БОНУСИ ===');
  console.log('Списано знижки бонусами: ' + bonusDiscount + ' грн');
  console.log('Залишок на картці: ' + bonusBalance + ' балів');
  console.log('До сплати після знижки: ' + finalToPay.toFixed(2) + ' грн');

  document.getElementById('btnApplyBonuses').disabled = true;
  document.getElementById('btnValidateCash').disabled = false;
}

function validateCashInput() {
  const cashInput = document.getElementById('cashInput');
  const msg = document.getElementById('validationMsg');
  let isValid = false;

  do {
    const rawValue = cashInput.value;

    if (rawValue === null || rawValue.trim() === '') {
      msg.className = 'text-xs text-red-500 font-bold';
      msg.textContent = 'Помилка: поле не може бути порожнім!';
      break;
    }

    const parsedCash = Number(rawValue);

    if (Number.isNaN(parsedCash) || parsedCash < finalToPay) {
      msg.className = 'text-xs text-red-500 font-bold';
      msg.textContent = 'Помилка: сума має бути числом не меншим за ' + finalToPay.toFixed(2) + ' грн!';
      break;
    }

    cashReceived = parsedCash;
    isValid = true;
  } while (!isValid);

  if (isValid) {
    msg.className = 'text-xs text-emerald-600 font-bold';
    msg.textContent = 'Оплату прийнято: ' + cashReceived.toFixed(2) + ' грн';

    document.getElementById('receiptCash').textContent = cashReceived.toFixed(2) + ' грн';
    document.getElementById('btnValidateCash').disabled = true;
    cashInput.disabled = true;
    document.getElementById('btnCalculateChange').disabled = false;

    console.log('=== ЕТАП 4: ОПЛАТА ===');
    console.log('Внесено готівки: ' + cashReceived.toFixed(2) + ' грн');
  }
}

function calculateChange() {
  let change = Math.round(cashReceived - finalToPay);
  let currentBanknoteIndex = 0;
  const resultContainer = document.getElementById('banknotesResult');
  resultContainer.innerHTML = '';

  document.getElementById('receiptChange').textContent = change.toFixed(2) + ' грн';

  console.log('=== ЕТАП 5: РЕШТА ===');
  console.log('Загальна решта: ' + change + ' грн');

  if (change === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'col-span-full text-sm text-slate-500 text-center py-2';
    emptyMsg.textContent = 'Без решти (точно під розрахунок).';
    resultContainer.appendChild(emptyMsg);
    console.log('Решта 0 грн.');
    document.getElementById('btnCalculateChange').disabled = true;
    return;
  }

  while (change > 0 && currentBanknoteIndex < banknoteDenominations.length) {
    const currentBanknote = banknoteDenominations[currentBanknoteIndex];
    const banknoteCount = Math.floor(change / currentBanknote);

    if (banknoteCount > 0) {
      change = change % currentBanknote;

      const banknote = document.createElement('div');
      banknote.className = 'rounded-xl border border-purple-200 bg-purple-50 p-2 text-center';

      const denominationBold = document.createElement('strong');
      denominationBold.className = 'block text-purple-800 text-xs font-bold';
      denominationBold.textContent = currentBanknote + ' грн';

      const countSpan = document.createElement('span');
      countSpan.className = 'text-[11px] text-purple-600 font-semibold';
      countSpan.textContent = banknoteCount + ' шт.';

      banknote.appendChild(denominationBold);
      banknote.appendChild(countSpan);
      resultContainer.appendChild(banknote);

      console.log(currentBanknote + ' грн x ' + banknoteCount);
    }

    currentBanknoteIndex++;
  }

  console.log('Решту видано повністю.');
  document.getElementById('btnCalculateChange').disabled = true;
}

function resetAll() {
  totalCheck = 0;
  bonusDiscount = 0;
  finalToPay = 0;
  cashReceived = 0;

  const receiptItems = document.getElementById('receiptItems');
  receiptItems.innerHTML = '';
  const initialText = document.createElement('p');
  initialText.className = 'text-slate-400 italic';
  initialText.textContent = 'Натисніть "Розрахувати кошик"...';
  receiptItems.appendChild(initialText);

  document.getElementById('receiptRawTotal').textContent = '0.00 грн';
  document.getElementById('receiptDiscount').textContent = '-0.00 грн';
  document.getElementById('receiptToPay').textContent = '0.00 грн';
  document.getElementById('receiptCash').textContent = '0.00 грн';
  document.getElementById('receiptChange').textContent = '0.00 грн';

  const bonusContainer = document.getElementById('bonusStepsContainer');
  bonusContainer.innerHTML = '';
  bonusContainer.classList.add('hidden');

  document.getElementById('banknotesResult').innerHTML = '';
  document.getElementById('validationMsg').textContent = '';

  const promoInput = document.getElementById('promoCodeInput');
  if (promoInput) promoInput.value = 'SALE-2024-UA';
  const promoMsg = document.getElementById('promoValidationMsg');
  if (promoMsg) promoMsg.textContent = '';

  document.getElementById('bonusBalanceInput').value = '310';
  const cashInput = document.getElementById('cashInput');
  cashInput.value = '';
  cashInput.disabled = false;

  document.getElementById('btnApplyBonuses').disabled = true;
  document.getElementById('btnValidateCash').disabled = true;
  document.getElementById('btnCalculateChange').disabled = true;

  console.clear();
  console.log('Термінал скинуто.');
}