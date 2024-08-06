const getPrice = (originalPrice, typePromotion) => {
  // Giảm giá khi người đùng đặt trước sản phẩm
  if (typePromotion === "preOrder") {
    return originalPrice * 0.8;
  } // Ở giai đoạn này nếu như bạn đã biêt về SOLID thi nó đã phá vỡ nguyên tắc đầu tiên, đó là nguyên tắc trách nhiện duy nhất

  // Tiếp tục thêm tính năng khuyến mãi thông thường ví dụ giá gốc < 200 thì giảm giá 10%, còn > thì giảm tối đa 30
  if (typePromotion === "promotion") {
    return originalPrice <= 200 ? originalPrice * 0.9 : originalPrice - 30;
  }

  //Thời xưa chwua marketing như bây giờ
  if (typePromotion === "default") {
    return originalPrice;
  }
};

console.log(`---> PRICE:::`, getPrice(200, "preOrder"));
