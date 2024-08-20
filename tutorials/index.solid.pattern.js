//Mục đích cao nhất để học design pattern là để giúp bạn viết code dễ đọc, dễ bảo trì và dễ mở rộng., để tiến xa hơn
//Mức độ cao nhât của việc học là hiểu các ý tưởng thiết kế của chúng và biết cách áp dụng chúng vào dự án của bạn.
// ví dụ ta quên tên vẫn  có thể giải quyết được vấn đề
//phân biệt design pattern và solid
//khác nhau:
//solid là nội lực của chúng ta, còn design pattern là cách chúng ta sử dụng nó
// nội lục trong BE laaf tư duy và kiến trúc
//S trong solid là Single Responsibility Principle: trách nhiệm duy nhất
// một lớp chỉ chịu trách nhiệm duy nhất một nhiệm vụ cụ thể

"use strict";
class Asset {
  // cho phép user mua bằng vàng
  buyItemGold(asset) {
    console.log(`Asset::: ${asset} was bought by Gold`);
  }
  buyItemCash(asset) {
    if (asset === "Macbook") {
      console.log(`Asset::: ${asset} was bought by  Cash VND`);
    } else {
      console.log(`Asset::: ${asset} was bought by Cash USD`);
    }
  }
}

class Client {
  static buy() {
    const asset = new Asset();
    asset.buyItemCash("House");
    asset.buyItemCash("Car");
    asset.buyItemGold("Stock");
    asset.buyItemCash("Macbook");
  }
}

Client.buy(); // Asset::: House was bought by Gold

// lập trình module trong js là cách tốt nhất để giữ cho code của bạn sạch sẽ và dễ bảo trì
