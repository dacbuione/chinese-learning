// Comprehensive lesson data for Chinese Learning App
// Following HSK structure and Vietnamese localization

export interface LessonData {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'writing';
  duration: number;
  xpReward: number;
  hskLevel: number;
  order: number;
  isActive: boolean;
  isLocked: boolean;
  progress: number;
  totalWords: number;
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
}

export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  audio?: string;
}

export interface GrammarPoint {
  id: string;
  title: string;
  explanation: string;
  example: string;
  translation: string;
}

export const COMPREHENSIVE_LESSONS_DATA: LessonData[] = [
  // === HSK 1 LEVEL ===
  {
    id: 'chao-hoi',
    title: 'Greetings & Introductions',
    titleVi: 'Chào hỏi & Giới thiệu',
    description: 'Learn basic greetings and how to introduce yourself',
    descriptionVi: 'Học cách chào hỏi cơ bản và giới thiệu bản thân',
    difficulty: 'beginner',
    type: 'vocabulary',
    duration: 15,
    xpReward: 100,
    hskLevel: 1,
    order: 1,
    isActive: true,
    isLocked: false,
    progress: 100,
    totalWords: 12,
    vocabulary: [
      { id: 'ni-hao', hanzi: '你好', pinyin: 'nǐ hǎo', english: 'hello', vietnamese: 'xin chào', tone: 3 },
      { id: 'wo', hanzi: '我', pinyin: 'wǒ', english: 'I/me', vietnamese: 'tôi', tone: 3 },
      { id: 'ni', hanzi: '你', pinyin: 'nǐ', english: 'you', vietnamese: 'bạn', tone: 3 },
      { id: 'shi', hanzi: '是', pinyin: 'shì', english: 'to be', vietnamese: 'là', tone: 4 },
      { id: 'jiao', hanzi: '叫', pinyin: 'jiào', english: 'to call/name', vietnamese: 'gọi/tên', tone: 4 },
      { id: 'xie-xie', hanzi: '谢谢', pinyin: 'xiè xiè', english: 'thank you', vietnamese: 'cảm ơn', tone: 4 },
      { id: 'zai-jian', hanzi: '再见', pinyin: 'zài jiàn', english: 'goodbye', vietnamese: 'tạm biệt', tone: 4 },
      { id: 'bu-ke-qi', hanzi: '不客气', pinyin: 'bù kè qì', english: 'you\'re welcome', vietnamese: 'không có gì', tone: 4 },
      { id: 'dui-bu-qi', hanzi: '对不起', pinyin: 'duì bu qǐ', english: 'sorry', vietnamese: 'xin lỗi', tone: 4 },
      { id: 'mei-guan-xi', hanzi: '没关系', pinyin: 'méi guān xi', english: 'it\'s okay', vietnamese: 'không sao', tone: 2 },
      { id: 'qing-wen', hanzi: '请问', pinyin: 'qǐng wèn', english: 'excuse me', vietnamese: 'xin hỏi', tone: 3 },
      { id: 'ming-zi', hanzi: '名字', pinyin: 'míng zi', english: 'name', vietnamese: 'tên', tone: 2 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Basic introduction with 我是...',
        explanation: 'Use 我是 + name/occupation to introduce yourself',
        example: '我是李明。',
        translation: 'Tôi là Lý Minh.'
      }
    ]
  },
  
  {
    id: 'gia-dinh',
    title: 'Family & Relationships',
    titleVi: 'Gia đình & Mối quan hệ',
    description: 'Learn about family members and relationships',
    descriptionVi: 'Học về thành viên gia đình và mối quan hệ',
    difficulty: 'beginner',
    type: 'vocabulary',
    duration: 20,
    xpReward: 120,
    hskLevel: 1,
    order: 2,
    isActive: true,
    isLocked: false,
    progress: 85,
    totalWords: 10,
    vocabulary: [
      { id: 'ba-ba', hanzi: '爸爸', pinyin: 'bà ba', english: 'dad', vietnamese: 'bố', tone: 4 },
      { id: 'ma-ma', hanzi: '妈妈', pinyin: 'mā ma', english: 'mom', vietnamese: 'mẹ', tone: 1 },
      { id: 'ge-ge', hanzi: '哥哥', pinyin: 'gē ge', english: 'older brother', vietnamese: 'anh trai', tone: 1 },
      { id: 'jie-jie', hanzi: '姐姐', pinyin: 'jiě jie', english: 'older sister', vietnamese: 'chị gái', tone: 3 },
      { id: 'di-di', hanzi: '弟弟', pinyin: 'dì di', english: 'younger brother', vietnamese: 'em trai', tone: 4 },
      { id: 'mei-mei', hanzi: '妹妹', pinyin: 'mèi mei', english: 'younger sister', vietnamese: 'em gái', tone: 4 },
      { id: 'jia', hanzi: '家', pinyin: 'jiā', english: 'home/family', vietnamese: 'nhà/gia đình', tone: 1 },
      { id: 'ren', hanzi: '人', pinyin: 'rén', english: 'person', vietnamese: 'người', tone: 2 },
      { id: 'peng-you', hanzi: '朋友', pinyin: 'péng yǒu', english: 'friend', vietnamese: 'bạn bè', tone: 2 },
      { id: 'lao-shi', hanzi: '老师', pinyin: 'lǎo shī', english: 'teacher', vietnamese: 'giáo viên', tone: 3 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Possessive structure with 的',
        explanation: 'Use pronoun + 的 + noun to show possession',
        example: '我的爸爸',
        translation: 'bố của tôi'
      }
    ]
  },

  {
    id: 'so-dem',
    title: 'Numbers & Time',
    titleVi: 'Số đếm & Thời gian',
    description: 'Learn to count and tell time in Chinese',
    descriptionVi: 'Học cách đếm số và nói thời gian trong tiếng Trung',
    difficulty: 'beginner',
    type: 'vocabulary',
    duration: 25,
    xpReward: 150,
    hskLevel: 1,
    order: 3,
    isActive: true,
    isLocked: false,
    progress: 75,
    totalWords: 15,
    vocabulary: [
      { id: 'yi', hanzi: '一', pinyin: 'yī', english: 'one', vietnamese: 'một', tone: 1 },
      { id: 'er', hanzi: '二', pinyin: 'èr', english: 'two', vietnamese: 'hai', tone: 4 },
      { id: 'san', hanzi: '三', pinyin: 'sān', english: 'three', vietnamese: 'ba', tone: 1 },
      { id: 'si', hanzi: '四', pinyin: 'sì', english: 'four', vietnamese: 'bốn', tone: 4 },
      { id: 'wu', hanzi: '五', pinyin: 'wǔ', english: 'five', vietnamese: 'năm', tone: 3 },
      { id: 'liu', hanzi: '六', pinyin: 'liù', english: 'six', vietnamese: 'sáu', tone: 4 },
      { id: 'qi', hanzi: '七', pinyin: 'qī', english: 'seven', vietnamese: 'bảy', tone: 1 },
      { id: 'ba', hanzi: '八', pinyin: 'bā', english: 'eight', vietnamese: 'tám', tone: 1 },
      { id: 'jiu', hanzi: '九', pinyin: 'jiǔ', english: 'nine', vietnamese: 'chín', tone: 3 },
      { id: 'shi', hanzi: '十', pinyin: 'shí', english: 'ten', vietnamese: 'mười', tone: 2 },
      { id: 'dian', hanzi: '点', pinyin: 'diǎn', english: 'o\'clock', vietnamese: 'giờ', tone: 3 },
      { id: 'fen', hanzi: '分', pinyin: 'fēn', english: 'minute', vietnamese: 'phút', tone: 1 },
      { id: 'xian-zai', hanzi: '现在', pinyin: 'xiàn zài', english: 'now', vietnamese: 'bây giờ', tone: 4 },
      { id: 'jin-tian', hanzi: '今天', pinyin: 'jīn tiān', english: 'today', vietnamese: 'hôm nay', tone: 1 },
      { id: 'ming-tian', hanzi: '明天', pinyin: 'míng tiān', english: 'tomorrow', vietnamese: 'ngày mai', tone: 2 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Time expressions',
        explanation: 'Use 点 for hours and 分 for minutes',
        example: '现在八点三十分',
        translation: 'Bây giờ là 8 giờ 30 phút'
      }
    ]
  },

  // === HSK 2 LEVEL ===
  {
    id: 'mua-sam',
    title: 'Shopping & Money',
    titleVi: 'Mua sắm & Tiền bạc',
    description: 'Learn shopping vocabulary and money expressions',
    descriptionVi: 'Học từ vựng mua sắm và cách diễn đạt về tiền',
    difficulty: 'elementary',
    type: 'vocabulary',
    duration: 30,
    xpReward: 180,
    hskLevel: 2,
    order: 4,
    isActive: true,
    isLocked: false,
    progress: 60,
    totalWords: 18,
    vocabulary: [
      { id: 'mai', hanzi: '买', pinyin: 'mǎi', english: 'to buy', vietnamese: 'mua', tone: 3 },
      { id: 'mai2', hanzi: '卖', pinyin: 'mài', english: 'to sell', vietnamese: 'bán', tone: 4 },
      { id: 'qian', hanzi: '钱', pinyin: 'qián', english: 'money', vietnamese: 'tiền', tone: 2 },
      { id: 'kuai', hanzi: '块', pinyin: 'kuài', english: 'yuan', vietnamese: 'kuài (tiền Trung)', tone: 4 },
      { id: 'duo-shao', hanzi: '多少', pinyin: 'duō shao', english: 'how much', vietnamese: 'bao nhiêu', tone: 1 },
      { id: 'gui', hanzi: '贵', pinyin: 'guì', english: 'expensive', vietnamese: 'đắt', tone: 4 },
      { id: 'pian-yi', hanzi: '便宜', pinyin: 'pián yi', english: 'cheap', vietnamese: 'rẻ', tone: 2 },
      { id: 'shang-dian', hanzi: '商店', pinyin: 'shāng diàn', english: 'shop', vietnamese: 'cửa hàng', tone: 1 },
      { id: 'dong-xi', hanzi: '东西', pinyin: 'dōng xi', english: 'thing', vietnamese: 'đồ vật', tone: 1 },
      { id: 'yi-fu', hanzi: '衣服', pinyin: 'yī fu', english: 'clothes', vietnamese: 'quần áo', tone: 1 },
      { id: 'xie', hanzi: '鞋', pinyin: 'xié', english: 'shoes', vietnamese: 'giày', tone: 2 },
      { id: 'shou-ji', hanzi: '手机', pinyin: 'shǒu jī', english: 'phone', vietnamese: 'điện thoại', tone: 3 },
      { id: 'dian-nao', hanzi: '电脑', pinyin: 'diàn nǎo', english: 'computer', vietnamese: 'máy tính', tone: 4 },
      { id: 'yao', hanzi: '要', pinyin: 'yào', english: 'to want', vietnamese: 'muốn', tone: 4 },
      { id: 'gei', hanzi: '给', pinyin: 'gěi', english: 'to give', vietnamese: 'cho', tone: 3 },
      { id: 'hao', hanzi: '好', pinyin: 'hǎo', english: 'good', vietnamese: 'tốt', tone: 3 },
      { id: 'da', hanzi: '大', pinyin: 'dà', english: 'big', vietnamese: 'to/lớn', tone: 4 },
      { id: 'xiao', hanzi: '小', pinyin: 'xiǎo', english: 'small', vietnamese: 'nhỏ', tone: 3 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Price questions with 多少钱',
        explanation: 'Use 多少钱 to ask about price',
        example: '这个多少钱？',
        translation: 'Cái này bao nhiêu tiền?'
      }
    ]
  },

  {
    id: 'am-thuc',
    title: 'Food & Dining',
    titleVi: 'Ẩm thực & Nhà hàng',
    description: 'Learn food vocabulary and restaurant phrases',
    descriptionVi: 'Học từ vựng về đồ ăn và cách giao tiếp trong nhà hàng',
    difficulty: 'elementary',
    type: 'vocabulary',
    duration: 35,
    xpReward: 200,
    hskLevel: 2,
    order: 5,
    isActive: true,
    isLocked: false,
    progress: 40,
    totalWords: 20,
    vocabulary: [
      { id: 'chi', hanzi: '吃', pinyin: 'chī', english: 'to eat', vietnamese: 'ăn', tone: 1 },
      { id: 'he', hanzi: '喝', pinyin: 'hē', english: 'to drink', vietnamese: 'uống', tone: 1 },
      { id: 'fan', hanzi: '饭', pinyin: 'fàn', english: 'rice/meal', vietnamese: 'cơm', tone: 4 },
      { id: 'mian', hanzi: '面', pinyin: 'miàn', english: 'noodles', vietnamese: 'mì', tone: 4 },
      { id: 'rou', hanzi: '肉', pinyin: 'ròu', english: 'meat', vietnamese: 'thịt', tone: 4 },
      { id: 'yu', hanzi: '鱼', pinyin: 'yú', english: 'fish', vietnamese: 'cá', tone: 2 },
      { id: 'ji', hanzi: '鸡', pinyin: 'jī', english: 'chicken', vietnamese: 'gà', tone: 1 },
      { id: 'shui-guo', hanzi: '水果', pinyin: 'shuǐ guǒ', english: 'fruit', vietnamese: 'hoa quả', tone: 3 },
      { id: 'ping-guo', hanzi: '苹果', pinyin: 'píng guǒ', english: 'apple', vietnamese: 'táo', tone: 2 },
      { id: 'cha', hanzi: '茶', pinyin: 'chá', english: 'tea', vietnamese: 'trà', tone: 2 },
      { id: 'ka-fei', hanzi: '咖啡', pinyin: 'kā fēi', english: 'coffee', vietnamese: 'cà phê', tone: 1 },
      { id: 'shui', hanzi: '水', pinyin: 'shuǐ', english: 'water', vietnamese: 'nước', tone: 3 },
      { id: 'pi-jiu', hanzi: '啤酒', pinyin: 'pí jiǔ', english: 'beer', vietnamese: 'bia', tone: 2 },
      { id: 'can-ting', hanzi: '餐厅', pinyin: 'cān tīng', english: 'restaurant', vietnamese: 'nhà hàng', tone: 1 },
      { id: 'fu-wu-yuan', hanzi: '服务员', pinyin: 'fú wù yuán', english: 'waiter', vietnamese: 'phục vụ', tone: 2 },
      { id: 'cai-dan', hanzi: '菜单', pinyin: 'cài dān', english: 'menu', vietnamese: 'thực đơn', tone: 4 },
      { id: 'hao-chi', hanzi: '好吃', pinyin: 'hǎo chī', english: 'delicious', vietnamese: 'ngon', tone: 3 },
      { id: 'e', hanzi: '饿', pinyin: 'è', english: 'hungry', vietnamese: 'đói', tone: 4 },
      { id: 'ke', hanzi: '渴', pinyin: 'kě', english: 'thirsty', vietnamese: 'khát', tone: 3 },
      { id: 'bao', hanzi: '饱', pinyin: 'bǎo', english: 'full', vietnamese: 'no', tone: 3 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Expressing preferences',
        explanation: 'Use 喜欢 to express likes',
        example: '我喜欢吃中国菜',
        translation: 'Tôi thích ăn món Trung Quốc'
      }
    ]
  },

  // === HSK 3 LEVEL ===
  {
    id: 'giao-thong',
    title: 'Transportation & Travel',
    titleVi: 'Giao thông & Du lịch',
    description: 'Learn transportation vocabulary and travel phrases',
    descriptionVi: 'Học từ vựng giao thông và du lịch',
    difficulty: 'intermediate',
    type: 'vocabulary',
    duration: 40,
    xpReward: 250,
    hskLevel: 3,
    order: 6,
    isActive: true,
    isLocked: false,
    progress: 25,
    totalWords: 22,
    vocabulary: [
      { id: 'qu', hanzi: '去', pinyin: 'qù', english: 'to go', vietnamese: 'đi', tone: 4 },
      { id: 'lai', hanzi: '来', pinyin: 'lái', english: 'to come', vietnamese: 'đến', tone: 2 },
      { id: 'zou', hanzi: '走', pinyin: 'zǒu', english: 'to walk', vietnamese: 'đi bộ', tone: 3 },
      { id: 'che', hanzi: '车', pinyin: 'chē', english: 'car/vehicle', vietnamese: 'xe', tone: 1 },
      { id: 'gong-gong-qi-che', hanzi: '公共汽车', pinyin: 'gōng gòng qì chē', english: 'bus', vietnamese: 'xe buýt', tone: 1 },
      { id: 'chu-zu-che', hanzi: '出租车', pinyin: 'chū zū chē', english: 'taxi', vietnamese: 'taxi', tone: 1 },
      { id: 'di-tie', hanzi: '地铁', pinyin: 'dì tiě', english: 'subway', vietnamese: 'tàu điện ngầm', tone: 4 },
      { id: 'fei-ji', hanzi: '飞机', pinyin: 'fēi jī', english: 'airplane', vietnamese: 'máy bay', tone: 1 },
      { id: 'huo-che', hanzi: '火车', pinyin: 'huǒ chē', english: 'train', vietnamese: 'tàu hỏa', tone: 3 },
      { id: 'zi-xing-che', hanzi: '自行车', pinyin: 'zì xíng chē', english: 'bicycle', vietnamese: 'xe đạp', tone: 4 },
      { id: 'lu', hanzi: '路', pinyin: 'lù', english: 'road', vietnamese: 'đường', tone: 4 },
      { id: 'jie', hanzi: '街', pinyin: 'jiē', english: 'street', vietnamese: 'phố', tone: 1 },
      { id: 'zhan', hanzi: '站', pinyin: 'zhàn', english: 'station', vietnamese: 'trạm', tone: 4 },
      { id: 'ji-chang', hanzi: '机场', pinyin: 'jī chǎng', english: 'airport', vietnamese: 'sân bay', tone: 1 },
      { id: 'yuan', hanzi: '远', pinyin: 'yuǎn', english: 'far', vietnamese: 'xa', tone: 3 },
      { id: 'jin', hanzi: '近', pinyin: 'jìn', english: 'near', vietnamese: 'gần', tone: 4 },
      { id: 'kuai', hanzi: '快', pinyin: 'kuài', english: 'fast', vietnamese: 'nhanh', tone: 4 },
      { id: 'man', hanzi: '慢', pinyin: 'màn', english: 'slow', vietnamese: 'chậm', tone: 4 },
      { id: 'zuo', hanzi: '左', pinyin: 'zuǒ', english: 'left', vietnamese: 'trái', tone: 3 },
      { id: 'you', hanzi: '右', pinyin: 'yòu', english: 'right', vietnamese: 'phải', tone: 4 },
      { id: 'zhi', hanzi: '直', pinyin: 'zhí', english: 'straight', vietnamese: 'thẳng', tone: 2 },
      { id: 'dao', hanzi: '到', pinyin: 'dào', english: 'to arrive', vietnamese: 'đến', tone: 4 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Direction and location',
        explanation: 'Use 在...的 to describe location',
        example: '银行在超市的左边',
        translation: 'Ngân hàng ở bên trái siêu thị'
      }
    ]
  },

  {
    id: 'thoi-tiet',
    title: 'Weather & Seasons',
    titleVi: 'Thời tiết & Mùa',
    description: 'Learn weather descriptions and seasons',
    descriptionVi: 'Học cách mô tả thời tiết và các mùa trong năm',
    difficulty: 'intermediate',
    type: 'vocabulary',
    duration: 30,
    xpReward: 200,
    hskLevel: 3,
    order: 7,
    isActive: true,
    isLocked: true,
    progress: 0,
    totalWords: 16,
    vocabulary: [
      { id: 'tian-qi', hanzi: '天气', pinyin: 'tiān qì', english: 'weather', vietnamese: 'thời tiết', tone: 1 },
      { id: 'tai-yang', hanzi: '太阳', pinyin: 'tài yáng', english: 'sun', vietnamese: 'mặt trời', tone: 4 },
      { id: 'yu', hanzi: '雨', pinyin: 'yǔ', english: 'rain', vietnamese: 'mưa', tone: 3 },
      { id: 'xue', hanzi: '雪', pinyin: 'xuě', english: 'snow', vietnamese: 'tuyết', tone: 3 },
      { id: 'feng', hanzi: '风', pinyin: 'fēng', english: 'wind', vietnamese: 'gió', tone: 1 },
      { id: 're', hanzi: '热', pinyin: 'rè', english: 'hot', vietnamese: 'nóng', tone: 4 },
      { id: 'leng', hanzi: '冷', pinyin: 'lěng', english: 'cold', vietnamese: 'lạnh', tone: 3 },
      { id: 'liang-kuai', hanzi: '凉快', pinyin: 'liáng kuài', english: 'cool', vietnamese: 'mát mẻ', tone: 2 },
      { id: 'chun-tian', hanzi: '春天', pinyin: 'chūn tiān', english: 'spring', vietnamese: 'mùa xuân', tone: 1 },
      { id: 'xia-tian', hanzi: '夏天', pinyin: 'xià tiān', english: 'summer', vietnamese: 'mùa hè', tone: 4 },
      { id: 'qiu-tian', hanzi: '秋天', pinyin: 'qiū tiān', english: 'autumn', vietnamese: 'mùa thu', tone: 1 },
      { id: 'dong-tian', hanzi: '冬天', pinyin: 'dōng tiān', english: 'winter', vietnamese: 'mùa đông', tone: 1 },
      { id: 'qing', hanzi: '晴', pinyin: 'qíng', english: 'sunny', vietnamese: 'nắng', tone: 2 },
      { id: 'yin', hanzi: '阴', pinyin: 'yīn', english: 'cloudy', vietnamese: 'âm u', tone: 1 },
      { id: 'wen-du', hanzi: '温度', pinyin: 'wēn dù', english: 'temperature', vietnamese: 'nhiệt độ', tone: 1 },
      { id: 'du', hanzi: '度', pinyin: 'dù', english: 'degree', vietnamese: 'độ', tone: 4 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Weather expressions',
        explanation: 'Use 天气 + adjective to describe weather',
        example: '今天天气很好',
        translation: 'Hôm nay thời tiết rất đẹp'
      }
    ]
  },

  {
    id: 'cong-viec',
    title: 'Work & Professions',
    titleVi: 'Công việc & Nghề nghiệp',
    description: 'Learn job titles and work-related vocabulary',
    descriptionVi: 'Học tên các nghề nghiệp và từ vựng liên quan đến công việc',
    difficulty: 'intermediate',
    type: 'vocabulary',
    duration: 35,
    xpReward: 220,
    hskLevel: 3,
    order: 8,
    isActive: true,
    isLocked: true,
    progress: 0,
    totalWords: 18,
    vocabulary: [
      { id: 'gong-zuo', hanzi: '工作', pinyin: 'gōng zuò', english: 'work/job', vietnamese: 'công việc', tone: 1 },
      { id: 'yi-sheng', hanzi: '医生', pinyin: 'yī shēng', english: 'doctor', vietnamese: 'bác sĩ', tone: 1 },
      { id: 'hu-shi', hanzi: '护士', pinyin: 'hù shi', english: 'nurse', vietnamese: 'y tá', tone: 4 },
      { id: 'jing-cha', hanzi: '警察', pinyin: 'jǐng chá', english: 'police', vietnamese: 'cảnh sát', tone: 3 },
      { id: 'si-ji', hanzi: '司机', pinyin: 'sī jī', english: 'driver', vietnamese: 'tài xế', tone: 1 },
      { id: 'chu-shi', hanzi: '厨师', pinyin: 'chú shī', english: 'chef', vietnamese: 'đầu bếp', tone: 2 },
      { id: 'gong-cheng-shi', hanzi: '工程师', pinyin: 'gōng chéng shī', english: 'engineer', vietnamese: 'kỹ sư', tone: 1 },
      { id: 'lu-shi', hanzi: '律师', pinyin: 'lǜ shī', english: 'lawyer', vietnamese: 'luật sư', tone: 4 },
      { id: 'jing-li', hanzi: '经理', pinyin: 'jīng lǐ', english: 'manager', vietnamese: 'quản lý', tone: 1 },
      { id: 'shou-huo-yuan', hanzi: '售货员', pinyin: 'shòu huò yuán', english: 'salesperson', vietnamese: 'nhân viên bán hàng', tone: 4 },
      { id: 'ban-gong-shi', hanzi: '办公室', pinyin: 'bàn gōng shì', english: 'office', vietnamese: 'văn phòng', tone: 4 },
      { id: 'gong-si', hanzi: '公司', pinyin: 'gōng sī', english: 'company', vietnamese: 'công ty', tone: 1 },
      { id: 'shang-ban', hanzi: '上班', pinyin: 'shàng bān', english: 'go to work', vietnamese: 'đi làm', tone: 4 },
      { id: 'xia-ban', hanzi: '下班', pinyin: 'xià bān', english: 'get off work', vietnamese: 'tan làm', tone: 4 },
      { id: 'mang', hanzi: '忙', pinyin: 'máng', english: 'busy', vietnamese: 'bận', tone: 2 },
      { id: 'lei', hanzi: '累', pinyin: 'lèi', english: 'tired', vietnamese: 'mệt', tone: 4 },
      { id: 'xiu-xi', hanzi: '休息', pinyin: 'xiū xi', english: 'rest', vietnamese: 'nghỉ ngơi', tone: 1 },
      { id: 'qian', hanzi: '钱', pinyin: 'qián', english: 'money', vietnamese: 'tiền', tone: 2 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Job descriptions',
        explanation: 'Use 是 + profession to describe jobs',
        example: '我是老师',
        translation: 'Tôi là giáo viên'
      }
    ]
  },

  {
    id: 'hoc-tap',
    title: 'Education & Learning',
    titleVi: 'Giáo dục & Học tập',
    description: 'Learn education vocabulary and school terms',
    descriptionVi: 'Học từ vựng về giáo dục và trường học',
    difficulty: 'intermediate',
    type: 'vocabulary',
    duration: 30,
    xpReward: 200,
    hskLevel: 3,
    order: 9,
    isActive: true,
    isLocked: true,
    progress: 0,
    totalWords: 16,
    vocabulary: [
      { id: 'xue-xi', hanzi: '学习', pinyin: 'xué xí', english: 'to study', vietnamese: 'học tập', tone: 2 },
      { id: 'xue-xiao', hanzi: '学校', pinyin: 'xué xiào', english: 'school', vietnamese: 'trường học', tone: 2 },
      { id: 'xue-sheng', hanzi: '学生', pinyin: 'xué shēng', english: 'student', vietnamese: 'học sinh', tone: 2 },
      { id: 'da-xue', hanzi: '大学', pinyin: 'dà xué', english: 'university', vietnamese: 'đại học', tone: 4 },
      { id: 'ban-ji', hanzi: '班级', pinyin: 'bān jí', english: 'class', vietnamese: 'lớp học', tone: 1 },
      { id: 'ke-cheng', hanzi: '课程', pinyin: 'kè chéng', english: 'course', vietnamese: 'khóa học', tone: 4 },
      { id: 'shu', hanzi: '书', pinyin: 'shū', english: 'book', vietnamese: 'sách', tone: 1 },
      { id: 'bi', hanzi: '笔', pinyin: 'bǐ', english: 'pen', vietnamese: 'bút', tone: 3 },
      { id: 'zhi', hanzi: '纸', pinyin: 'zhǐ', english: 'paper', vietnamese: 'giấy', tone: 3 },
      { id: 'kao-shi', hanzi: '考试', pinyin: 'kǎo shì', english: 'exam', vietnamese: 'kỳ thi', tone: 3 },
      { id: 'zuo-ye', hanzi: '作业', pinyin: 'zuò yè', english: 'homework', vietnamese: 'bài tập về nhà', tone: 4 },
      { id: 'wen-ti', hanzi: '问题', pinyin: 'wèn tí', english: 'question', vietnamese: 'câu hỏi', tone: 4 },
      { id: 'da-an', hanzi: '答案', pinyin: 'dá àn', english: 'answer', vietnamese: 'câu trả lời', tone: 2 },
      { id: 'cong-ming', hanzi: '聪明', pinyin: 'cōng míng', english: 'smart', vietnamese: 'thông minh', tone: 1 },
      { id: 'nu-li', hanzi: '努力', pinyin: 'nǔ lì', english: 'hardworking', vietnamese: 'chăm chỉ', tone: 3 },
      { id: 'jin-bu', hanzi: '进步', pinyin: 'jìn bù', english: 'progress', vietnamese: 'tiến bộ', tone: 4 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Academic expressions',
        explanation: 'Use 学习 + subject to talk about studying',
        example: '我学习中文',
        translation: 'Tôi học tiếng Trung'
      }
    ]
  },

  {
    id: 'suc-khoe',
    title: 'Health & Body',
    titleVi: 'Sức khỏe & Cơ thể',
    description: 'Learn health vocabulary and body parts',
    descriptionVi: 'Học từ vựng về sức khỏe và các bộ phận cơ thể',
    difficulty: 'advanced',
    type: 'vocabulary',
    duration: 40,
    xpReward: 250,
    hskLevel: 4,
    order: 10,
    isActive: true,
    isLocked: true,
    progress: 0,
    totalWords: 20,
    vocabulary: [
      { id: 'sheng-bing', hanzi: '生病', pinyin: 'shēng bìng', english: 'to be sick', vietnamese: 'bị bệnh', tone: 1 },
      { id: 'tou', hanzi: '头', pinyin: 'tóu', english: 'head', vietnamese: 'đầu', tone: 2 },
      { id: 'yan-jing', hanzi: '眼睛', pinyin: 'yǎn jīng', english: 'eyes', vietnamese: 'mắt', tone: 3 },
      { id: 'er-duo', hanzi: '耳朵', pinyin: 'ěr duo', english: 'ears', vietnamese: 'tai', tone: 3 },
      { id: 'bi-zi', hanzi: '鼻子', pinyin: 'bí zi', english: 'nose', vietnamese: 'mũi', tone: 2 },
      { id: 'zui', hanzi: '嘴', pinyin: 'zuǐ', english: 'mouth', vietnamese: 'miệng', tone: 3 },
      { id: 'shou', hanzi: '手', pinyin: 'shǒu', english: 'hand', vietnamese: 'tay', tone: 3 },
      { id: 'jiao', hanzi: '脚', pinyin: 'jiǎo', english: 'foot', vietnamese: 'chân', tone: 3 },
      { id: 'tou-teng', hanzi: '头疼', pinyin: 'tóu téng', english: 'headache', vietnamese: 'đau đầu', tone: 2 },
      { id: 'fa-shao', hanzi: '发烧', pinyin: 'fā shāo', english: 'fever', vietnamese: 'sốt', tone: 1 },
      { id: 'ke-sou', hanzi: '咳嗽', pinyin: 'ké sòu', english: 'cough', vietnamese: 'ho', tone: 2 },
      { id: 'gan-mao', hanzi: '感冒', pinyin: 'gǎn mào', english: 'cold', vietnamese: 'cảm lạnh', tone: 3 },
      { id: 'yao', hanzi: '药', pinyin: 'yào', english: 'medicine', vietnamese: 'thuốc', tone: 4 },
      { id: 'yi-yuan', hanzi: '医院', pinyin: 'yī yuàn', english: 'hospital', vietnamese: 'bệnh viện', tone: 1 },
      { id: 'jian-kang', hanzi: '健康', pinyin: 'jiàn kāng', english: 'healthy', vietnamese: 'khỏe mạnh', tone: 4 },
      { id: 'yun-dong', hanzi: '运动', pinyin: 'yùn dòng', english: 'exercise', vietnamese: 'thể dục', tone: 4 },
      { id: 'shuì-jiao', hanzi: '睡觉', pinyin: 'shuì jiào', english: 'sleep', vietnamese: 'ngủ', tone: 4 },
      { id: 'xi-zao', hanzi: '洗澡', pinyin: 'xǐ zǎo', english: 'bathe', vietnamese: 'tắm', tone: 3 },
      { id: 'shou-shou', hanzi: '瘦', pinyin: 'shòu', english: 'thin', vietnamese: 'gầy', tone: 4 },
      { id: 'pang', hanzi: '胖', pinyin: 'pàng', english: 'fat', vietnamese: 'béo', tone: 4 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Health expressions',
        explanation: 'Use 生病 to describe being sick',
        example: '我生病了',
        translation: 'Tôi bị bệnh'
      }
    ]
  }
];

// Helper functions for data access
export const getLessonById = (id: string): LessonData | undefined => {
  return COMPREHENSIVE_LESSONS_DATA.find(lesson => lesson.id === id);
};

export const getLessonsByHSKLevel = (level: number): LessonData[] => {
  return COMPREHENSIVE_LESSONS_DATA.filter(lesson => lesson.hskLevel === level);
};

export const getLessonsByType = (type: string): LessonData[] => {
  return COMPREHENSIVE_LESSONS_DATA.filter(lesson => lesson.type === type);
};

export const getAvailableLessons = (): LessonData[] => {
  return COMPREHENSIVE_LESSONS_DATA.filter(lesson => !lesson.isLocked);
};

export const getTotalLessons = (): number => {
  return COMPREHENSIVE_LESSONS_DATA.length;
};

export default COMPREHENSIVE_LESSONS_DATA; 