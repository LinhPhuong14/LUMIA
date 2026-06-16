export type ProductBadge = { text: string };
export type ProductSection = {
  title: string;
  items?: string[];
  text?: string;
};

export type StoreProductDetail = {
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  price_vnd: number;
  category: string;
  emoji: string;
  color: string; // CSS gradient for hero
  badges: string[];
  volume?: string;
  weight?: string;
  ingredients: string;
  sections: ProductSection[];
  scent_description?: string;
  manufacturer: {
    company: string;
    address: string;
    hotline?: string;
    website?: string;
    origin: string;
    producer?: string;
    producer_address?: string;
    standard?: string;
    mfg?: string;
    exp?: string;
  };
};

export const STORE_PRODUCTS_DETAIL: StoreProductDetail[] = [
  /* ── Tinh dầu xịt Oải Hương ── */
  {
    slug: "xit-oai-huong",
    name: "Tinh dầu xịt Oải Hương",
    subtitle: "Lavender · 100ml",
    tagline: "Thơm tĩnh tâm từ loài hoa Oải Hương ven biển Địa Trung Hải",
    price_vnd: 150000,
    category: "scent",
    emoji: "🌿",
    color: "linear-gradient(135deg, #e8d5f0 0%, #d4b8e8 50%, #c5a8d8 100%)",
    badges: ["Thành phần tự nhiên", "An toàn sức khỏe", "Xuất xứ rõ ràng", "Nguyên chất 100%"],
    volume: "100ml",
    ingredients: "Lavender Essential Oil (Tinh dầu Oải Hương nguyên chất), Ethanol (cồn thực phẩm), Aqua (nước tinh khiết).",
    scent_description: "Thơm tĩnh tâm từ loài hoa Oải Hương của ven biển Địa Trung Hải. Giúp cải thiện tinh thần, tạo cảm giác thư giãn, thoải mái, giải tỏa căng thẳng mệt mỏi và giảm stress. Làm sạch không gian sống và xua đuổi côn trùng như ruồi, muỗi, kiến, gián.",
    sections: [
      {
        title: "Khử mùi, làm thơm",
        items: [
          "Phòng khách và các loại bàn ghế sofa",
          "Phòng ngủ và trọn bộ chăn ga gối nệm",
          "Phòng bếp và các loại dụng cụ bếp",
          "Phòng vệ sinh và nội thất như bồn cầu, nhà tắm",
          "Dành cho thú cưng (chuồng trại và sàn nhà)",
        ],
      },
      {
        title: "Xịt thơm, lưu hương thời trang",
        items: [
          "Tất cả các loại quần áo",
          "Các loại mũ nón vải, mũ bảo hiểm",
          "Vệ sinh giày dép, sneaker",
          "Các loại phụ kiện thời trang (túi xách, thắt lưng)",
        ],
      },
      {
        title: "Hướng dẫn sử dụng",
        text: "Lắc đều sản phẩm trước khi dùng, xịt trực tiếp vào các vật thể: Xịt tạo hương, khử mùi, vệ sinh bề mặt (dùng khăn hoặc giấy lau khô). Xịt thơm, làm sạch không gian sống. Xịt thanh lọc không khí, xua đuổi các loại côn trùng gây hại.",
      },
      {
        title: "Cảnh báo an toàn",
        items: [
          "Tránh xa tầm tay trẻ em",
          "Không xịt trực tiếp vào lửa và nơi có nhiệt độ cao",
          "Đậy nắp kỹ sau khi sử dụng",
          "Không uống hoặc xịt vào thực phẩm",
          "Tránh tiếp xúc trực tiếp với mắt (nếu dính vào mắt rửa bằng nước sạch)",
        ],
      },
      {
        title: "Bảo quản",
        text: "Nơi khô ráo, thoáng mát và tránh ánh nắng chiếu trực tiếp từ mặt trời.",
      },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
      producer: "Công ty TNHH VUA TINH DẦU",
      producer_address: "24 Nguyễn Dĩnh, Thôn Khuông Phò Nam, Xã Quảng Điền, TP. Huế",
      mfg: "03/12/2025",
      exp: "03/12/2028",
    },
  },

  /* ── Tinh dầu xịt Trà Trắng ── */
  {
    slug: "xit-tra-trang",
    name: "Tinh dầu xịt Trà Trắng",
    subtitle: "White Tea · 100ml",
    tagline: "Hương thơm thuần khiết từ loài hoa Trà Trắng trong sáng",
    price_vnd: 150000,
    category: "scent",
    emoji: "🍵",
    color: "linear-gradient(135deg, #e8f0e0 0%, #d4e4c8 50%, #c0d8a8 100%)",
    badges: ["Thành phần tự nhiên", "An toàn sức khỏe", "Xuất xứ rõ ràng", "Nguyên chất 100%"],
    volume: "100ml",
    ingredients: "White Tea Essential Oil (Tinh dầu Trà Trắng nguyên chất), Ethanol (cồn thực phẩm), Aqua (nước tinh khiết).",
    scent_description: "Hương thơm thuần khiết từ loài hoa Trà Trắng trong sáng. Tạo cảm giác thư giãn, thoải mái, giải tỏa căng thẳng mệt mỏi. Làm sạch không gian sống và xua đuổi côn trùng.",
    sections: [
      {
        title: "Khử mùi, làm thơm",
        items: [
          "Phòng khách và các loại bàn ghế sofa",
          "Phòng ngủ và trọn bộ chăn ga gối nệm",
          "Phòng bếp và các loại dụng cụ bếp",
          "Phòng vệ sinh và nội thất như bồn cầu, nhà tắm",
          "Dành cho thú cưng (chuồng trại và sàn nhà)",
        ],
      },
      {
        title: "Xịt thơm, lưu hương thời trang",
        items: [
          "Tất cả các loại quần áo",
          "Các loại mũ nón vải, mũ bảo hiểm",
          "Vệ sinh giày dép, sneaker",
          "Các loại phụ kiện thời trang (túi xách, thắt lưng)",
        ],
      },
      {
        title: "Hướng dẫn sử dụng",
        text: "Lắc đều sản phẩm trước khi dùng, xịt trực tiếp vào các vật thể. Xịt tạo hương, khử mùi, vệ sinh bề mặt. Xịt thơm, làm sạch không gian sống. Xịt thanh lọc không khí, xua đuổi côn trùng gây hại.",
      },
      {
        title: "Cảnh báo an toàn",
        items: [
          "Tránh xa tầm tay trẻ em",
          "Không xịt trực tiếp vào lửa và nơi có nhiệt độ cao",
          "Đậy nắp kỹ sau khi sử dụng",
          "Không uống hoặc xịt vào thực phẩm",
          "Tránh tiếp xúc trực tiếp với mắt",
        ],
      },
      { title: "Bảo quản", text: "Nơi khô ráo, thoáng mát và tránh ánh nắng trực tiếp." },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
      producer: "Công ty TNHH VUA TINH DẦU",
      producer_address: "24 Nguyễn Dĩnh, Thôn Khuông Phò Nam, Xã Quảng Điền, TP. Huế",
      standard: "TCCS: 04:2025/VNT",
      mfg: "03/12/2025",
      exp: "03/12/2028",
    },
  },

  /* ── Tinh dầu xịt Bạch Đàn Chanh ── */
  {
    slug: "xit-bach-dan-chanh",
    name: "Tinh dầu xịt Bạch Đàn Chanh",
    subtitle: "Eucalyptus Lemon · 100ml",
    tagline: "Thơm thanh tẩy từ những rừng cây Bạch Đàn Chanh bát ngát",
    price_vnd: 150000,
    category: "scent",
    emoji: "🌿",
    color: "linear-gradient(135deg, #d8f0d0 0%, #bce8b0 50%, #a0d090 100%)",
    badges: ["Thành phần tự nhiên", "An toàn sức khỏe", "Xuất xứ rõ ràng", "Nguyên chất 100%"],
    volume: "100ml",
    ingredients: "Alcohol 70% (cồn thực phẩm), Eucalyptus Essential Oil (tinh dầu Bạch Đàn Chanh) và một số nguyên phụ liệu.",
    scent_description: "Thơm thanh tẩy từ những rừng cây Bạch Đàn Chanh bát ngát. Tạo cảm giác thư giãn, thoải mái và sảng khoái. Làm sạch không gian sống và xua đuổi côn trùng như ruồi, muỗi, kiến, gián.",
    sections: [
      {
        title: "Khử mùi, làm thơm",
        items: [
          "Phòng khách và các loại bàn ghế sofa",
          "Phòng ngủ và trọn bộ chăn ga gối nệm",
          "Phòng bếp và các loại dụng cụ bếp",
          "Phòng vệ sinh và nội thất như bồn cầu, nhà tắm",
          "Dành cho thú cưng (chuồng trại và sàn nhà)",
        ],
      },
      {
        title: "Xịt thơm, lưu hương thời trang",
        items: [
          "Tất cả các loại quần áo",
          "Các loại mũ nón vải, mũ bảo hiểm",
          "Vệ sinh giày dép, sneaker",
          "Các loại phụ kiện thời trang (túi xách, thắt lưng)",
        ],
      },
      {
        title: "Hướng dẫn sử dụng",
        text: "Lắc đều sản phẩm trước khi dùng, xịt trực tiếp vào các vật thể. Xịt tạo hương, khử mùi, vệ sinh bề mặt. Xịt thơm, làm sạch không gian sống. Xịt thanh lọc không khí, xua đuổi côn trùng gây hại.",
      },
      {
        title: "Cảnh báo an toàn",
        items: [
          "Tránh xa tầm tay trẻ em",
          "Không xịt trực tiếp vào lửa và nơi có nhiệt độ cao",
          "Đậy nắp kỹ sau khi sử dụng",
          "Không uống hoặc xịt vào thực phẩm",
          "Tránh tiếp xúc trực tiếp với mắt",
        ],
      },
      { title: "Bảo quản", text: "Nơi khô ráo, thoáng mát và tránh ánh nắng trực tiếp." },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
      producer: "Công ty TNHH VUA TINH DẦU",
      producer_address: "24 Nguyễn Dĩnh, Thôn Khuông Phò Nam, Xã Quảng Điền, TP. Huế",
      standard: "TCCS: 04:2025/VNT",
      mfg: "03/12/2025",
      exp: "03/12/2028",
    },
  },

  /* ── Tinh dầu xịt Hoa Lài ── */
  {
    slug: "xit-hoa-lai",
    name: "Tinh dầu xịt Hoa Lài",
    subtitle: "Jasmine · 100ml",
    tagline: "Thơm tinh tế từ loài Hoa Lài trắng tinh khôi",
    price_vnd: 150000,
    category: "scent",
    emoji: "🌸",
    color: "linear-gradient(135deg, #fdf0f8 0%, #f8d8f0 50%, #f0c0e0 100%)",
    badges: ["Thành phần tự nhiên", "An toàn sức khỏe", "Xuất xứ rõ ràng", "Nguyên chất 100%"],
    volume: "100ml",
    ingredients: "Jasmine Essential Oil (Tinh dầu Hoa Lài nguyên chất), Ethanol (cồn thực phẩm), Aqua (nước tinh khiết).",
    scent_description: "Thơm tinh tế từ loài Hoa Lài trắng tinh khôi. Tạo cảm giác thư giãn, thoải mái, giải tỏa căng thẳng mệt mỏi. Làm sạch không gian sống và xua đuổi côn trùng.",
    sections: [
      {
        title: "Khử mùi, làm thơm",
        items: [
          "Phòng khách và các loại bàn ghế sofa",
          "Phòng ngủ và trọn bộ chăn ga gối nệm",
          "Phòng bếp và các loại dụng cụ bếp",
          "Phòng vệ sinh và nội thất như bồn cầu, nhà tắm",
          "Dành cho thú cưng (chuồng trại và sàn nhà)",
        ],
      },
      {
        title: "Xịt thơm, lưu hương thời trang",
        items: [
          "Tất cả các loại quần áo",
          "Các loại mũ nón vải, mũ bảo hiểm",
          "Vệ sinh giày dép, sneaker",
          "Các loại phụ kiện thời trang (túi xách, thắt lưng)",
        ],
      },
      {
        title: "Hướng dẫn sử dụng",
        text: "Lắc đều sản phẩm trước khi dùng, xịt trực tiếp vào các vật thể. Xịt tạo hương, khử mùi, vệ sinh bề mặt. Xịt thơm, làm sạch không gian sống. Xịt thanh lọc không khí, xua đuổi côn trùng gây hại.",
      },
      {
        title: "Cảnh báo an toàn",
        items: [
          "Tránh xa tầm tay trẻ em",
          "Không xịt trực tiếp vào lửa và nơi có nhiệt độ cao",
          "Đậy nắp kỹ sau khi sử dụng",
          "Không uống hoặc xịt vào thực phẩm",
          "Tránh tiếp xúc trực tiếp với mắt",
        ],
      },
      { title: "Bảo quản", text: "Nơi khô ráo, thoáng mát và tránh ánh nắng trực tiếp." },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
      producer: "Công ty TNHH VUA TINH DẦU",
      producer_address: "24 Nguyễn Dĩnh, Thôn Khuông Phò Nam, Xã Quảng Điền, TP. Huế",
      standard: "TCCS: 04:2025/VNT",
      mfg: "03/12/2025",
      exp: "03/12/2028",
    },
  },

  /* ── Nến thơm ── */
  {
    slug: "nen-thom",
    name: "Nến thơm LUMIA",
    subtitle: "Sáp đậu nành · Hoa khô tự nhiên · 300g",
    tagline: "Thơm, thư giãn và trang trí không gian sống",
    price_vnd: 265000,
    category: "scent",
    emoji: "🕯️",
    color: "linear-gradient(135deg, #fdf8e8 0%, #f8eec8 50%, #f0e0a8 100%)",
    badges: ["Sáp đậu nành", "Hoa khô tự nhiên", "40h cháy", "300g"],
    weight: "300g | KT: 7cm × 9cm | 40H cháy",
    ingredients: "Sáp đậu nành, trang trí hoa khô tự nhiên.",
    sections: [
      {
        title: "Mùi hương – Fresh Spring",
        text: "Hương thơm tươi mát của cỏ cây hoa quả mùa xuân. Đầu: Chanh, Quýt, Nho. Giữa: Oải hương, Huệ tây, Hoa hồng, Hoa nhài. Cuối: Hương phấn hoa, Gió biển.",
      },
      {
        title: "Mùi hương – Fruit Temptation",
        text: "Hương thơm ngọt ngào của các loại quả chín pha chút hương hoa, mang lại không gian ngọt ngào lãng mạn. Đầu: Xoài, Đào, Mật ong. Giữa: Caramel, Mâm xôi, Quýt. Cuối: Bưởi, Chanh.",
      },
      {
        title: "Mùi hương – Orange OS",
        text: "Hương thơm của cam, của gỗ có chút trầm ấm, sảng khoái và thư giãn. Đầu: Cam, Quýt, Bưởi. Giữa: Hoa hồng, Quả hoắc hương, Hoa phong lữ. Cuối: Tiêu, Benzoin.",
      },
      {
        title: "Lưu ý khi đốt nến",
        items: [
          "Cắt bấc nến trước khi đốt còn khoảng 5mm",
          "Cắt bớt những nhánh hoa gần bấc để hạn chế bén lửa",
          "Chỉ đốt ở khu vực ít gió (tránh gió quạt và điều hòa)",
          "Nến dùng trang trí cũng đã rất thơm, không nhất thiết phải đốt",
        ],
      },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
    },
  },

  /* ── Tinh dầu khuếch tán ── */
  {
    slug: "set-khuech-tan-tinh-dau",
    name: "Tinh dầu khuếch tán Lumia",
    subtitle: "50ml · Que khuếch tán tự nhiên",
    tagline: "Tinh Hoa Thiên Nhiên - Thơm Mát Không Gian",
    price_vnd: 100000,
    category: "scent",
    emoji: "🌺",
    color: "linear-gradient(135deg, #f0e8f8 0%, #e0d0f0 50%, #d0b8e8 100%)",
    badges: ["Không cần điện", "Không đốt nóng", "50ml", "Que khuếch tán"],
    volume: "50ml",
    ingredients: "Tinh dầu thiên nhiên, cồn thực phẩm và hương liệu cao cấp.",
    scent_description: "Mang hương thơm tinh tế lan tỏa khắp căn phòng. Hương thơm dịu nhẹ, lan tỏa tự nhiên. Thiết kế tinh tế, phù hợp với phòng khách, phòng ngủ, văn phòng, spa hoặc cửa hàng. Dễ sử dụng, không cần điện hay đốt nóng.",
    sections: [
      {
        title: "Hướng dẫn sử dụng",
        items: [
          "Bước 1: Tháo nắp kim loại bên ngoài chai",
          "Bước 2: Tháo nút nhựa bảo vệ",
          "Bước 3: Cắm các que khuếch tán vào chai tinh dầu",
          "Bước 4: Lật ngược đầu que khuếch tán để hương thơm lan tỏa nhanh hơn",
          "Bước 5: Đặt tại vị trí yêu thích - phòng khách, phòng ngủ, bàn làm việc hoặc quầy lễ tân",
        ],
      },
      {
        title: "Mẹo sử dụng",
        text: "Điều chỉnh độ đậm nhạt của hương thơm bằng cách tăng hoặc giảm số lượng que khuếch tán, hoặc thay đổi tần suất lật que.",
      },
      {
        title: "Lưu ý an toàn",
        items: [
          "Không sử dụng để uống",
          "Tránh tiếp xúc trực tiếp với mắt",
          "Để xa tầm tay trẻ em và vật nuôi",
          "Nếu tinh dầu dính vào da, rửa sạch bằng nước",
          "Không đặt gần nguồn lửa hoặc nơi có nhiệt độ cao",
        ],
      },
      {
        title: "Bảo quản",
        text: "Nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và nguồn nhiệt cao.",
      },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
      mfg: "07/02/2026",
      exp: "03 năm kể từ ngày sản xuất",
    },
  },

  /* ── Trà thảo mộc ── */
  {
    slug: "tra-thao-moc",
    name: "Trà thảo mộc Lumia",
    subtitle: "Hộp 20 túi lọc",
    tagline: "Sự kết hợp hài hòa của hoa cúc, táo đỏ, hoa nhài, hoa hồng, dâu tằm và kỷ tử",
    price_vnd: 120000,
    category: "drink",
    emoji: "🍵",
    color: "linear-gradient(135deg, #f8f0e0 0%, #f0e0c0 50%, #e8d0a0 100%)",
    badges: ["Thành phần tự nhiên", "Không phẩm màu", "Không chất bảo quản", "20 túi lọc"],
    ingredients: "Hoa cúc, táo đỏ, hoa nhài, hoa hồng, dâu tằm, kỷ tử.",
    sections: [
      {
        title: "Thành phần tự nhiên",
        items: [
          "Hoa cúc - Hương thơm nhẹ nhàng, tạo cảm giác thư thái",
          "Táo đỏ - Giàu vitamin, khoáng chất và chất chống oxy hóa",
          "Hoa nhài - Hương thơm thanh khiết, dễ chịu",
          "Hoa hồng - Hương vị dịu nhẹ, dưỡng sinh",
          "Dâu tằm - Chứa anthocyanin và chất chống oxy hóa tự nhiên",
          "Kỷ tử - Giàu carotenoid và dưỡng chất thực vật",
        ],
      },
      {
        title: "Điểm nổi bật",
        items: [
          "Hương thơm tự nhiên từ các loại hoa và thảo mộc",
          "Mang lại cảm giác thư giãn, dễ chịu sau những giờ làm việc",
          "Bổ sung các hợp chất chống oxy hóa từ nguyên liệu thực vật",
          "Phù hợp dùng nóng hoặc lạnh, thưởng thức hằng ngày",
          "Lựa chọn thay thế lành mạnh cho đồ uống chứa nhiều đường",
        ],
      },
      {
        title: "Gợi ý pha trà",
        text: "Cho 1 túi trà vào 200-300ml nước nóng từ 80-90°C. Hãm từ 5-10 phút để các thành phần thảo mộc tiết ra hương vị tự nhiên. Có thể thêm mật ong hoặc thưởng thức lạnh tùy sở thích.",
      },
      {
        title: "Lưu ý",
        text: "Sản phẩm không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Hiệu quả cảm nhận có thể khác nhau tùy cơ địa và thói quen sử dụng của mỗi người.",
      },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
    },
  },

  /* ── Bịt mắt lụa ── */
  {
    slug: "bit-mat-lua",
    name: "Bịt mắt lụa Lumia",
    subtitle: "Lụa satin cao cấp",
    tagline: "Che sáng hoàn toàn, bảo vệ vùng mắt, nâng cao chất lượng giấc ngủ",
    price_vnd: 165000,
    category: "sleep",
    emoji: "🌙",
    color: "linear-gradient(135deg, #e8e0f8 0%, #d8c8f0 50%, #c8b0e8 100%)",
    badges: ["Lụa satin", "Che sáng hiệu quả", "Hỗ trợ ngủ sâu", "Dây điều chỉnh"],
    ingredients: "Lụa satin tự nhiên, dây đeo co giãn điều chỉnh được.",
    sections: [
      {
        title: "Tính năng nổi bật",
        items: [
          "Che sáng 100% giúp não bộ nhận tín hiệu tối, đi vào giấc ngủ sâu nhanh hơn",
          "Chất lụa satin mềm mại, không gây kích ứng vùng da mắt nhạy cảm",
          "Dây đeo điều chỉnh phù hợp với nhiều kích cỡ đầu",
          "Nhẹ nhàng, thoáng khí - có thể đeo cả đêm thoải mái",
          "Phù hợp khi ngủ ban ngày, du lịch, trên máy bay",
        ],
      },
      {
        title: "Hướng dẫn sử dụng",
        text: "Điều chỉnh dây đeo vừa khít với đầu. Đặt miếng che mắt sao cho che kín hoàn toàn vùng mắt. Giữ sạch bằng cách giặt nhẹ tay với nước lạnh và phơi trong bóng mát.",
      },
      {
        title: "Bảo quản",
        text: "Giặt tay nhẹ nhàng với xà phòng nhẹ. Không sấy khô hoặc vắt mạnh. Bảo quản trong túi đựng kèm theo để tránh bụi bẩn.",
      },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
    },
  },

  /* ── Chuông thiền ── */
  {
    slug: "chuong-thien",
    name: "Chuông thiền Lumia",
    subtitle: "Chuông đồng · Vỗ gỗ · Đệm lót",
    tagline: "Âm thanh trong trẻo giúp tập trung và đi vào trạng thái thiền định sâu",
    price_vnd: 330000,
    category: "meditation",
    emoji: "✨",
    color: "linear-gradient(135deg, #f8f0d8 0%, #f0e0b8 50%, #e8d098 100%)",
    badges: ["Chuông đồng thật", "Âm thanh trong trẻo", "Đệm lót kèm theo", "Vỗ gỗ"],
    ingredients: "Chuông bằng đồng thau, vỗ gỗ tự nhiên, đệm lót vải nhung.",
    sections: [
      {
        title: "Công dụng",
        items: [
          "Đánh dấu đầu và cuối mỗi buổi thiền định",
          "Âm thanh trong trẻo giúp tập trung tâm trí, xóa tan lo âu",
          "Hỗ trợ các bài tập hít thở và mindfulness",
          "Tạo không gian thiền định trang nghiêm, yên tĩnh",
          "Phù hợp với yoga, meditation, spa và liệu pháp âm thanh",
        ],
      },
      {
        title: "Hướng dẫn sử dụng",
        text: "Đặt chuông trên đệm lót. Dùng vỗ gỗ gõ nhẹ vào thành chuông để tạo âm. Có thể xoay vỗ gỗ theo thành chuông để tạo âm kéo dài. Âm thanh sẽ lan tỏa và kéo dài trong không gian giúp tập trung thiền định.",
      },
      {
        title: "Bảo quản",
        text: "Lau sạch bằng vải mềm sau khi sử dụng. Tránh để ẩm ướt. Bảo quản trong hộp hoặc túi vải để giữ bề mặt đồng sáng bóng.",
      },
    ],
    manufacturer: {
      company: "CÔNG TY TNHH LUMIA",
      address: "173 Thôn 4, Xã Hòa Lạc, TP. Hà Nội",
      hotline: "0962.628.004",
      origin: "Việt Nam",
    },
  },
];

export function getProductBySlug(slug: string): StoreProductDetail | undefined {
  return STORE_PRODUCTS_DETAIL.find((p) => p.slug === slug);
}

// Also expose slugs that map to the spray product category
export const SPRAY_PRODUCT_SLUGS = ["xit-oai-huong", "xit-tra-trang", "xit-bach-dan-chanh", "xit-hoa-lai"];
