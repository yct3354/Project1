export function fxIndexMap(fxTag: string) {
  let fxIndex = 0;
  switch (fxTag) {
    case "EUR":
      fxIndex = 0;
      break;
    case "USD":
      fxIndex = 1;
      break;
    case "SEK":
      fxIndex = 2;
      break;
    case "JPY":
      fxIndex = 3;
      break;
    case "CHF":
      fxIndex = 4;
      break;
    case "CNY":
      fxIndex = 5;
      break;
    case "HKD":
      fxIndex = 6;
      break;
    case "GBP":
      fxIndex = 7;
      break;
    case "CAD":
      fxIndex = 8;
      break;
    case "AUD":
      fxIndex = 9;
      break;
    case "SGD":
      fxIndex = 10;
      break;
    case "NZD":
      fxIndex = 11;
      break;
    case "INR":
      fxIndex = 12;
      break;
    case "KRW":
      fxIndex = 13;
      break;
    case "TWD":
      fxIndex = 14;
      break;
    case "NOK":
      fxIndex = 15;
      break;
    case "DKK":
      fxIndex = 16;
      break;
    case "THB":
      fxIndex = 17;
      break;
    case "IDR":
      fxIndex = 18;
      break;
  }
  return fxIndex;
}
