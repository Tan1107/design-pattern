const defaultPrice = (originalPrice) => {
  return originalPrice;
};

const dayPrice = (originalPrice) => {
  return originalPrice * 0.6;
};

const preOrderPrice = (originalPrice) => {
  return originalPrice - 40;
};

const promotionPrice = (originalPrice) => {
  return originalPrice * 0.8;
};

const blackFridayPrice = (originalPrice) => {
  return originalPrice * 0.9;
};

const nodayPrice = (originalPrice) => {
  return originalPrice
}

const getPriceStrategies = {
  preOrder: preOrderPrice,
  promotion: promotionPrice,
  blackFriday: blackFridayPrice,
  default: defaultPrice,
  nodayPrice: nodayPrice
};

const getPrice = (originalPrice, typePromotion) => {
  return getPriceStrategies[typePromotion](originalPrice)
};

console.log(`==> PRICE:::`, getPrice(200, "nodayPrice"));
