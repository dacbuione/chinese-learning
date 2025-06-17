import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../src/theme';
import { useVocabularyTTS } from '../../../src/hooks/useTTS';

const { width } = Dimensions.get('window');

interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  audio?: string;
}

interface GrammarPoint {
  id: string;
  title: string;
  explanation: string;
  example: string;
  translation: string;
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  level: string;
  progress: number;
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  totalItems: number;
  completedItems: number;
}

const lessonData: Record<string, LessonData> = {
  // === LEVEL 1: HSK 1 Foundation ===
  'chao-hoi': {
    id: 'chao-hoi',
    title: 'Chào hỏi & Giới thiệu',
    description: 'Làm quen với các cách chào hỏi cơ bản và cách giới thiệu bản thân',
    level: 'HSK 1',
    progress: 100,
    totalItems: 15,
    completedItems: 15,
    vocabulary: [
      { id: 'ni-hao', hanzi: '你好', pinyin: 'nǐ hǎo', english: 'hello', vietnamese: 'xin chào', tone: 3 },
      { id: 'nin-hao', hanzi: '您好', pinyin: 'nín hǎo', english: 'hello (formal)', vietnamese: 'xin chào (lịch sự)', tone: 2 },
      { id: 'zai-jian', hanzi: '再见', pinyin: 'zài jiàn', english: 'goodbye', vietnamese: 'tạm biệt', tone: 4 },
      { id: 'wo', hanzi: '我', pinyin: 'wǒ', english: 'I/me', vietnamese: 'tôi', tone: 3 },
      { id: 'ni', hanzi: '你', pinyin: 'nǐ', english: 'you', vietnamese: 'bạn', tone: 3 },
      { id: 'ta-he', hanzi: '他', pinyin: 'tā', english: 'he/him', vietnamese: 'anh ấy', tone: 1 },
      { id: 'ta-she', hanzi: '她', pinyin: 'tā', english: 'she/her', vietnamese: 'cô ấy', tone: 1 },
      { id: 'shi', hanzi: '是', pinyin: 'shì', english: 'to be', vietnamese: 'là', tone: 4 },
      { id: 'jiao', hanzi: '叫', pinyin: 'jiào', english: 'to call/name', vietnamese: 'gọi/tên', tone: 4 },
      { id: 'xie-xie', hanzi: '谢谢', pinyin: 'xiè xiè', english: 'thank you', vietnamese: 'cảm ơn', tone: 4 },
      { id: 'bu-ke-qi', hanzi: '不客气', pinyin: 'bù kè qì', english: 'you\'re welcome', vietnamese: 'không có gì', tone: 4 },
      { id: 'dui-bu-qi', hanzi: '对不起', pinyin: 'duì bu qǐ', english: 'sorry', vietnamese: 'xin lỗi', tone: 4 },
      { id: 'mei-guan-xi', hanzi: '没关系', pinyin: 'méi guān xi', english: 'it\'s okay', vietnamese: 'không sao', tone: 2 },
      { id: 'qing-wen', hanzi: '请问', pinyin: 'qǐng wèn', english: 'excuse me', vietnamese: 'xin hỏi', tone: 3 },
      { id: 'ming-zi', hanzi: '名字', pinyin: 'míng zi', english: 'name', vietnamese: 'tên', tone: 2 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Cấu trúc "A 是 B" (A là B)',
        explanation: 'Cấu trúc cơ bản nhất: Chủ ngữ + 是 + Tân ngữ. Dùng để giới thiệu, xác định danh tính.',
        example: '我是学生。你是老师。',
        translation: 'Tôi là học sinh. Bạn là giáo viên.'
      },
      {
        id: '2', 
        title: 'Cấu trúc "我叫..." (Tôi tên là...)',
        explanation: 'Dùng để giới thiệu tên: 我叫 + tên. Thân thiện hơn "我是..."',
        example: '我叫李明。你叫什么名字？',
        translation: 'Tôi tên là Lý Minh. Bạn tên là gì?'
      },
      {
        id: '3',
        title: 'Xin lỗi và đáp lại',
        explanation: 'Dùng 对不起 để xin lỗi nghiêm túc và 没关系 để đáp lại "không sao"',
        example: 'A: 对不起，我迟到了。 B: 没关系。',
        translation: 'A: Xin lỗi, tôi đến muộn. B: Không sao.'
      },
      {
        id: '4',
        title: 'Đại từ nhân xưng và cách dùng',
        explanation: '我 (tôi), 你 (bạn), 他/她 (anh ấy/cô ấy). Lưu ý: 你 thân mật, 您 lịch sự.',
        example: '我是学生，你是老师，他是医生。',
        translation: 'Tôi là học sinh, bạn là giáo viên, anh ấy là bác sĩ.'
      }
    ]
  },

  'gia-dinh': {
    id: 'gia-dinh',
    title: 'Gia đình & Mối quan hệ',
    description: 'Học từ vựng về thành viên gia đình và cách mô tả mối quan hệ',
    level: 'HSK 1',
    progress: 85,
    totalItems: 12,
    completedItems: 10,
    vocabulary: [
      { id: 'ba-ba', hanzi: '爸爸', pinyin: 'bà ba', english: 'dad/father', vietnamese: 'bố/cha', tone: 4 },
      { id: 'ma-ma', hanzi: '妈妈', pinyin: 'mā ma', english: 'mom/mother', vietnamese: 'mẹ', tone: 1 },
      { id: 'ge-ge', hanzi: '哥哥', pinyin: 'gē ge', english: 'older brother', vietnamese: 'anh trai', tone: 1 },
      { id: 'jie-jie', hanzi: '姐姐', pinyin: 'jiě jie', english: 'older sister', vietnamese: 'chị gái', tone: 3 },
      { id: 'di-di', hanzi: '弟弟', pinyin: 'dì di', english: 'younger brother', vietnamese: 'em trai', tone: 4 },
      { id: 'mei-mei', hanzi: '妹妹', pinyin: 'mèi mei', english: 'younger sister', vietnamese: 'em gái', tone: 4 },
      { id: 'lao-gong', hanzi: '老公', pinyin: 'lǎo gōng', english: 'husband', vietnamese: 'chồng', tone: 3 },
      { id: 'lao-po', hanzi: '老婆', pinyin: 'lǎo pó', english: 'wife', vietnamese: 'vợ', tone: 3 },
      { id: 'er-zi', hanzi: '儿子', pinyin: 'ér zi', english: 'son', vietnamese: 'con trai', tone: 2 },
      { id: 'nv-er', hanzi: '女儿', pinyin: 'nǚ ér', english: 'daughter', vietnamese: 'con gái', tone: 3 },
      { id: 'peng-you', hanzi: '朋友', pinyin: 'péng yǒu', english: 'friend', vietnamese: 'bạn bè', tone: 2 },
      { id: 'jia', hanzi: '家', pinyin: 'jiā', english: 'home/family', vietnamese: 'nhà/gia đình', tone: 1 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Cấu trúc sở hữu "我的..." (của tôi)',
        explanation: 'Thêm 的 sau đại từ để chỉ sở hữu: 我的, 你的, 他的',
        example: '这是我的爸爸，那是我的妈妈。',
        translation: 'Đây là bố tôi, kia là mẹ tôi.'
      },
      {
        id: '2',
        title: 'Câu hỏi "有几个...?" (có mấy...?)',
        explanation: 'Dùng để hỏi số lượng thành viên trong gia đình',
        example: '你家有几个人？我家有四个人。',
        translation: 'Nhà bạn có mấy người? Nhà tôi có bốn người.'
      }
    ]
  },

  'so-dem': {
    id: 'so-dem',
    title: 'Số đếm & Thời gian',
    description: 'Học cách đếm số từ 1-100 và biểu đạt thời gian cơ bản',
    level: 'HSK 1',
    progress: 75,
    totalItems: 15,
    completedItems: 11,
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
      { id: 'bai', hanzi: '百', pinyin: 'bǎi', english: 'hundred', vietnamese: 'trăm', tone: 3 },
      { id: 'qian', hanzi: '千', pinyin: 'qiān', english: 'thousand', vietnamese: 'nghìn', tone: 1 },
      { id: 'dian', hanzi: '点', pinyin: 'diǎn', english: 'o\'clock', vietnamese: 'giờ', tone: 3 },
      { id: 'fen', hanzi: '分', pinyin: 'fēn', english: 'minute', vietnamese: 'phút', tone: 1 },
      { id: 'xian-zai', hanzi: '现在', pinyin: 'xiàn zài', english: 'now', vietnamese: 'bây giờ', tone: 4 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Quy tắc số đếm 11-99',
        explanation: '十一, 十二, ... 二十, 二十一, ... Cấu trúc: [chục][đơn vị]',
        example: '十一，二十，二十五，九十九',
        translation: 'Mười một, hai mười, hai mười lăm, chín mười chín'
      },
      {
        id: '2',
        title: 'Nói giờ: "X点Y分" (X giờ Y phút)',
        explanation: 'Giờ + 点 + phút + 分. Lưu ý: "半" = 30 phút',
        example: '现在八点三十分。/ 现在八点半。',
        translation: 'Bây giờ là 8 giờ 30 phút. / Bây giờ là 8 giờ rưỡi.'
      }
    ]
  },

  // === LEVEL 2: HSK 2 Intermediate ===
  'mua-sam': {
    id: 'mua-sam',
    title: 'Mua sắm & Giao dịch',
    description: 'Học từ vựng và cấu trúc câu để mua sắm, hỏi giá, và giao dịch',
    level: 'HSK 2',
    progress: 60,
    totalItems: 18,
    completedItems: 11,
    vocabulary: [
      { id: 'mai', hanzi: '买', pinyin: 'mǎi', english: 'to buy', vietnamese: 'mua', tone: 3 },
      { id: 'mai2', hanzi: '卖', pinyin: 'mài', english: 'to sell', vietnamese: 'bán', tone: 4 },
      { id: 'qian2', hanzi: '钱', pinyin: 'qián', english: 'money', vietnamese: 'tiền', tone: 2 },
      { id: 'kuai', hanzi: '块', pinyin: 'kuài', english: 'yuan (money)', vietnamese: 'nhân dân tệ', tone: 4 },
      { id: 'mao', hanzi: '毛', pinyin: 'máo', english: 'jiao (0.1 yuan)', vietnamese: 'hào', tone: 2 },
      { id: 'duo-shao', hanzi: '多少', pinyin: 'duō shao', english: 'how much/many', vietnamese: 'bao nhiêu', tone: 1 },
      { id: 'gui', hanzi: '贵', pinyin: 'guì', english: 'expensive', vietnamese: 'đắt', tone: 4 },
      { id: 'pian-yi', hanzi: '便宜', pinyin: 'pián yi', english: 'cheap', vietnamese: 'rẻ', tone: 2 },
      { id: 'shang-dian', hanzi: '商店', pinyin: 'shāng diàn', english: 'shop/store', vietnamese: 'cửa hàng', tone: 1 },
      { id: 'chao-shi', hanzi: '超市', pinyin: 'chāo shì', english: 'supermarket', vietnamese: 'siêu thị', tone: 1 },
      { id: 'dong-xi', hanzi: '东西', pinyin: 'dōng xi', english: 'thing/stuff', vietnamese: 'đồ vật', tone: 1 },
      { id: 'yi-fu', hanzi: '衣服', pinyin: 'yī fu', english: 'clothes', vietnamese: 'quần áo', tone: 1 },
      { id: 'xie', hanzi: '鞋', pinyin: 'xié', english: 'shoes', vietnamese: 'giày', tone: 2 },
      { id: 'bao', hanzi: '包', pinyin: 'bāo', english: 'bag', vietnamese: 'túi xách', tone: 1 },
      { id: 'shou-ji', hanzi: '手机', pinyin: 'shǒu jī', english: 'mobile phone', vietnamese: 'điện thoại', tone: 3 },
      { id: 'dian-nao', hanzi: '电脑', pinyin: 'diàn nǎo', english: 'computer', vietnamese: 'máy tính', tone: 4 },
      { id: 'yao', hanzi: '要', pinyin: 'yào', english: 'to want', vietnamese: 'muốn', tone: 4 },
      { id: 'gei', hanzi: '给', pinyin: 'gěi', english: 'to give', vietnamese: 'đưa/cho', tone: 3 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Hỏi giá: "多少钱?" (bao nhiêu tiền?)',
        explanation: 'Cấu trúc hỏi giá cơ bản. Trả lời: X块Y毛',
        example: 'A: 这个多少钱？B: 五十块。',
        translation: 'A: Cái này bao nhiêu tiền? B: Năm mười kuài.'
      },
      {
        id: '2',
        title: 'Cấu trúc "我要..." (tôi muốn...)',
        explanation: 'Dùng để nói muốn mua gì. 要 + danh từ',
        example: '我要买一件衣服。',
        translation: 'Tôi muốn mua một cái áo.'
      },
      {
        id: '3',
        title: 'Từ chỉ định lượng cơ bản',
        explanation: 'Số + từ chỉ định lượng + danh từ. VD: 一件衣服, 一双鞋',
        example: '我买了三件衣服，两双鞋。',
        translation: 'Tôi đã mua ba cái áo, hai đôi giày.'
      }
    ]
  },

  'am-thuc': {
    id: 'am-thuc',
    title: 'Ẩm thực & Nhà hàng',
    description: 'Từ vựng về đồ ăn, thức uống và cách gọi món trong nhà hàng',
    level: 'HSK 2',
    progress: 40,
    totalItems: 20,
    completedItems: 8,
    vocabulary: [
      { id: 'chi', hanzi: '吃', pinyin: 'chī', english: 'to eat', vietnamese: 'ăn', tone: 1 },
      { id: 'he', hanzi: '喝', pinyin: 'hē', english: 'to drink', vietnamese: 'uống', tone: 1 },
      { id: 'fan', hanzi: '饭', pinyin: 'fàn', english: 'rice/meal', vietnamese: 'cơm/bữa ăn', tone: 4 },
      { id: 'mian', hanzi: '面', pinyin: 'miàn', english: 'noodles', vietnamese: 'mì', tone: 4 },
      { id: 'rou', hanzi: '肉', pinyin: 'ròu', english: 'meat', vietnamese: 'thịt', tone: 4 },
      { id: 'yu', hanzi: '鱼', pinyin: 'yú', english: 'fish', vietnamese: 'cá', tone: 2 },
      { id: 'ji', hanzi: '鸡', pinyin: 'jī', english: 'chicken', vietnamese: 'gà', tone: 1 },
      { id: 'niu-rou', hanzi: '牛肉', pinyin: 'niú ròu', english: 'beef', vietnamese: 'thịt bò', tone: 2 },
      { id: 'zhu-rou', hanzi: '猪肉', pinyin: 'zhū ròu', english: 'pork', vietnamese: 'thịt heo', tone: 1 },
      { id: 'shui-guo', hanzi: '水果', pinyin: 'shuǐ guǒ', english: 'fruit', vietnamese: 'hoa quả', tone: 3 },
      { id: 'ping-guo', hanzi: '苹果', pinyin: 'píng guǒ', english: 'apple', vietnamese: 'táo', tone: 2 },
      { id: 'xiang-jiao', hanzi: '香蕉', pinyin: 'xiāng jiāo', english: 'banana', vietnamese: 'chuối', tone: 1 },
      { id: 'cha', hanzi: '茶', pinyin: 'chá', english: 'tea', vietnamese: 'trà', tone: 2 },
      { id: 'ka-fei', hanzi: '咖啡', pinyin: 'kā fēi', english: 'coffee', vietnamese: 'cà phê', tone: 1 },
      { id: 'shui', hanzi: '水', pinyin: 'shuǐ', english: 'water', vietnamese: 'nước', tone: 3 },
      { id: 'pi-jiu', hanzi: '啤酒', pinyin: 'pí jiǔ', english: 'beer', vietnamese: 'bia', tone: 2 },
      { id: 'can-ting', hanzi: '餐厅', pinyin: 'cān tīng', english: 'restaurant', vietnamese: 'nhà hàng', tone: 1 },
      { id: 'fu-wu-yuan', hanzi: '服务员', pinyin: 'fú wù yuán', english: 'waiter/waitress', vietnamese: 'phục vụ', tone: 2 },
      { id: 'cai-dan', hanzi: '菜单', pinyin: 'cài dān', english: 'menu', vietnamese: 'thực đơn', tone: 4 },
      { id: 'mai-dan', hanzi: '买单', pinyin: 'mǎi dān', english: 'to pay the bill', vietnamese: 'thanh toán', tone: 3 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Thể hiện sở thích: "我喜欢..." (tôi thích...)',
        explanation: 'Dùng 喜欢 + danh từ/động từ để nói về sở thích',
        example: '我喜欢吃中国菜，不喜欢喝咖啡。',
        translation: 'Tôi thích ăn món Trung Quốc, không thích uống cà phê.'
      },
      {
        id: '2',
        title: 'Gọi món: "我要..." (tôi gọi...)',
        explanation: 'Trong nhà hàng dùng 我要 + món ăn để gọi món',
        example: '我要一碗面条，一杯茶。',
        translation: 'Tôi gọi một tô mì, một ly trà.'
      }
    ]
  },

  // === LEVEL 3: HSK 3 Advanced ===
  'giao-thong': {
    id: 'giao-thong',
    title: 'Giao thông & Du lịch',
    description: 'Từ vựng về phương tiện giao thông, hỏi đường và du lịch',
    level: 'HSK 3',
    progress: 25,
    totalItems: 22,
    completedItems: 5,
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
      { id: 'zhan', hanzi: '站', pinyin: 'zhàn', english: 'station/stop', vietnamese: 'trạm', tone: 4 },
      { id: 'ji-chang', hanzi: '机场', pinyin: 'jī chǎng', english: 'airport', vietnamese: 'sân bay', tone: 1 },
      { id: 'huo-che-zhan', hanzi: '火车站', pinyin: 'huǒ chē zhàn', english: 'train station', vietnamese: 'ga tàu', tone: 3 },
      { id: 'yuan', hanzi: '远', pinyin: 'yuǎn', english: 'far', vietnamese: 'xa', tone: 3 },
      { id: 'jin', hanzi: '近', pinyin: 'jìn', english: 'near', vietnamese: 'gần', tone: 4 },
      { id: 'kuai', hanzi: '快', pinyin: 'kuài', english: 'fast', vietnamese: 'nhanh', tone: 4 },
      { id: 'man', hanzi: '慢', pinyin: 'màn', english: 'slow', vietnamese: 'chậm', tone: 4 },
      { id: 'zuo', hanzi: '左', pinyin: 'zuǒ', english: 'left', vietnamese: 'trái', tone: 3 },
      { id: 'you', hanzi: '右', pinyin: 'yòu', english: 'right', vietnamese: 'phải', tone: 4 },
      { id: 'zhi', hanzi: '直', pinyin: 'zhí', english: 'straight', vietnamese: 'thẳng', tone: 2 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Phương hướng và vị trí: "在...的..." (ở ... của ...)',
        explanation: 'Diễn tả vị trí tương đối: 在 + địa điểm + 的 + phương hướng',
        example: '银行在超市的左边。',
        translation: 'Ngân hàng ở bên trái siêu thị.'
      },
      {
        id: '2',
        title: 'Hỏi đường: "...怎么走?" (đi ... như thế nào?)',
        explanation: 'Cấu trúc hỏi đường cơ bản',
        example: '请问，去机场怎么走？',
        translation: 'Xin hỏi, đi sân bay như thế nào?'
      }
    ]
  }
};

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar' | 'practice'>('vocabulary');
  const [selectedVocab, setSelectedVocab] = useState<string | null>(null);

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  const lesson = id ? lessonData[id] : null;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy bài học</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getToneColor = (tone: number) => {
    const toneColors = {
      1: colors.error[500],    // Thanh ngang - đỏ
      2: colors.warning[500],  // Thanh sắc - vàng
      3: colors.accent[500],   // Thanh huyền - xanh lá
      4: colors.primary[500],  // Thanh nặng - xanh dương
    };
    return toneColors[tone as keyof typeof toneColors] || colors.neutral[500];
  };

  const handleVocabAudio = async (item: VocabularyItem) => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: item.hanzi,
          pinyin: item.pinyin,
          tone: item.tone,
        });
      }
    } catch (error) {
      console.error('Vocabulary TTS Error:', error);
      Alert.alert('Lỗi phát âm', 'Không thể phát âm từ vựng. Vui lòng thử lại.');
    }
  };

  const renderVocabularyTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Từ vựng ({lesson.vocabulary.length} từ)</Text>
      {lesson.vocabulary.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.vocabularyCard,
            selectedVocab === item.id && styles.selectedCard
          ]}
          onPress={() => {
            // Navigate to vocabulary detail screen
            router.push(`/vocabulary/${item.id}`);
          }}
        >
          <View style={styles.vocabularyHeader}>
            <View style={styles.toneRow}>
              <View style={[styles.toneIndicator, { backgroundColor: getToneColor(item.tone) }]} />
              <Text style={styles.toneText}>Thanh {item.tone}</Text>
            </View>
            <TouchableOpacity style={styles.audioButton} onPress={() => handleVocabAudio(item)}>
              <Text style={styles.audioButtonText}>🔊</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.hanzi}>{item.hanzi}</Text>
          <Text style={styles.pinyin}>{item.pinyin}</Text>
          
          <View style={styles.translations}>
            <Text style={styles.english}>{item.english}</Text>
            <Text style={styles.vietnamese}>{item.vietnamese}</Text>
          </View>

          {selectedVocab === item.id && (
            <View style={styles.expandedContent}>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Luyện tập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Thêm vào yêu thích</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGrammarTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Ngữ pháp ({lesson.grammar.length} điểm)</Text>
      {lesson.grammar.map((item) => (
        <View key={item.id} style={styles.grammarCard}>
          <Text style={styles.grammarTitle}>{item.title}</Text>
          <Text style={styles.grammarExplanation}>{item.explanation}</Text>
          
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Ví dụ:</Text>
            <Text style={styles.exampleChinese}>{item.example}</Text>
            <Text style={styles.exampleTranslation}>{item.translation}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPracticeTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Luyện tập</Text>
      
      {/* Interactive Exercises - như Duolingo */}
      <TouchableOpacity 
        style={[styles.practiceCard, styles.exerciseCard]}
        onPress={() => router.push(`/lessons/exercise?lessonId=${lesson.id}&exerciseType=all`)}
      >
        <View style={styles.exerciseHeader}>
          <Text style={styles.practiceTitle}>🎯 Bài tập tương tác</Text>
          <View style={styles.exerciseBadge}>
            <Text style={styles.exerciseBadgeText}>MỚI</Text>
          </View>
        </View>
        <Text style={styles.practiceDescription}>
          Bài tập đa dạng như Duolingo: dịch thuật, nghe chọn, trắc nghiệm
        </Text>
        <Text style={styles.practiceTime}>⏱️ 10-15 phút • 5 bài tập</Text>
      </TouchableOpacity>

      {/* Traditional Practice */}
      <TouchableOpacity 
        style={styles.practiceCard}
        onPress={() => router.push(`/practice/vocabulary?lesson=${lesson.id}`)}
      >
        <Text style={styles.practiceTitle}>📚 Luyện từ vựng</Text>
        <Text style={styles.practiceDescription}>Ôn tập {lesson.vocabulary.length} từ vựng trong bài</Text>
        <Text style={styles.practiceTime}>⏱️ 5-10 phút</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.practiceCard}
        onPress={() => router.push(`/practice/pronunciation?lesson=${lesson.id}`)}
      >
        <Text style={styles.practiceTitle}>🗣️ Luyện phát âm</Text>
        <Text style={styles.practiceDescription}>Thực hành phát âm các từ trong bài</Text>
        <Text style={styles.practiceTime}>⏱️ 10-15 phút</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/lessons')}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonLevel}>{lesson.level}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Tiến độ: {lesson.completedItems}/{lesson.totalItems} ({lesson.progress}%)
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${lesson.progress}%` }]} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vocabulary' && styles.activeTab]}
          onPress={() => setActiveTab('vocabulary')}
        >
          <Text style={[styles.tabText, activeTab === 'vocabulary' && styles.activeTabText]}>
            Từ vựng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'grammar' && styles.activeTab]}
          onPress={() => setActiveTab('grammar')}
        >
          <Text style={[styles.tabText, activeTab === 'grammar' && styles.activeTabText]}>
            Ngữ pháp
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'practice' && styles.activeTab]}
          onPress={() => setActiveTab('practice')}
        >
          <Text style={[styles.tabText, activeTab === 'practice' && styles.activeTabText]}>
            Luyện tập
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'vocabulary' && renderVocabularyTab()}
        {activeTab === 'grammar' && renderGrammarTab()}
        {activeTab === 'practice' && renderPracticeTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    marginRight: getResponsiveSpacing('md'),
  },
  backButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontWeight: '500',
  },
  headerInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[900],
  },
  lessonLevel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginTop: 2,
  },
  progressContainer: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
  },
  progressInfo: {
    marginBottom: getResponsiveSpacing('sm'),
  },
  progressText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
         backgroundColor: colors.accent[500],
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    marginHorizontal: getResponsiveSpacing('lg'),
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('sm'),
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.neutral[50],
  },
  tabText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary[600],
  },
  content: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
  },
  tabContent: {
    paddingBottom: getResponsiveSpacing('xl'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
  },
  vocabularyCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: Layout.isMobile ? 12 : 16,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: Layout.isMobile ? 2 : 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: Layout.isMobile ? 3 : 6,
    elevation: Layout.isMobile ? 3 : 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  selectedCard: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  toneIndicator: {
    width: Layout.isMobile ? 8 : 12,
    height: Layout.isMobile ? 8 : 12,
    borderRadius: Layout.isMobile ? 4 : 6,
  },
  toneText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  audioButton: {
    width: Layout.isMobile ? 36 : 44,
    height: Layout.isMobile ? 36 : 44,
    borderRadius: Layout.isMobile ? 18 : 22,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButtonText: {
    fontSize: Layout.isMobile ? 16 : 20,
  },
  hanzi: {
    fontSize: getResponsiveFontSize(Layout.isMobile ? '4xl' : '5xl'),
    fontFamily: 'System',
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
    lineHeight: getResponsiveFontSize(Layout.isMobile ? '4xl' : '5xl') * 1.2,
  },
  pinyin: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
    fontStyle: 'italic',
    fontWeight: '500',
  },
  translations: {
    gap: getResponsiveSpacing('xs'),
    alignItems: 'center',
  },
  english: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    textAlign: 'center',
    fontWeight: '400',
  },
  vietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    textAlign: 'center',
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: getResponsiveSpacing('md'),
    paddingTop: getResponsiveSpacing('md'),
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[50],
    fontWeight: '500',
  },
  grammarCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  grammarTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  grammarExplanation: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: getResponsiveSpacing('md'),
  },
  exampleContainer: {
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: getResponsiveSpacing('md'),
  },
  exampleLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
    marginBottom: getResponsiveSpacing('xs'),
  },
  exampleChinese: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
    fontFamily: 'System',
    marginBottom: getResponsiveSpacing('xs'),
  },
  exampleTranslation: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  practiceCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  practiceTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  practiceDescription: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('sm'),
  },
  practiceTime: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  // Exercise Styles
  exerciseCard: {
    borderWidth: 2,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[25],
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  exerciseBadge: {
    backgroundColor: colors.accent[500],
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseBadgeText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  exerciseTypeGrid: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('md'),
  },
  miniExerciseCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 80,
  },
  translationCard: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[25],
  },
  audioCard: {
    borderColor: colors.secondary[300],
    backgroundColor: colors.secondary[25],
  },
  choiceCard: {
    borderColor: colors.accent[300],
    backgroundColor: colors.accent[25],
  },
  miniExerciseIcon: {
    fontSize: getResponsiveFontSize('lg'),
    marginBottom: getResponsiveSpacing('xs'),
  },
  miniExerciseTitle: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: 2,
  },
  miniExerciseDesc: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
}); 