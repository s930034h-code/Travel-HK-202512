import { DailyItinerary, GeneralInfo, WeatherForecast } from './types';

export const ITINERARY_DATA: DailyItinerary[] = [
  {
    day: 1,
    date: '12/12 (五)',
    title: '抵港、油麻地、中環、太平山',
    suggestion: '今天是體力活！太平山纜車人多，改搭小巴更有港味，但會暈車的記得坐前排。晚上山上風大，夜景雖美但別著涼，薄外套必備！',
    events: [
      { 
        time: '06:00-08:20', 
        activity: '到達桃園機場(T1) 報到登機', 
        location: 'TPE T1', 
        transport: '接送', 
        icon: 'flight',
        googleMapLink: 'https://maps.app.goo.gl/TPE'
      },
      { 
        time: '10:30-12:30', 
        activity: '抵達香港、前往酒店', 
        location: 'HKG → 油麻地', 
        transport: '機場快線→青衣→港鐵', 
        notes: '酒店寄放行李', 
        icon: 'transport',
        googleMapLink: 'https://maps.app.goo.gl/CityviewHK'
      },
      { 
        time: '13:00-14:30', 
        activity: '午餐：一品雞煲火鍋', 
        location: '旺角/油麻地', 
        notes: '必吃秘製雞煲', 
        icon: 'food',
        recommendedFood: '秘製雞煲、炸響鈴、手切肥牛',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=一品雞煲火鍋+旺角'
      },
      { 
        time: '15:00-15:30', 
        activity: '酒店 Check-in', 
        location: '城景國際', 
        notes: '稍作整頓', 
        icon: 'hotel',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=城景國際'
      },
      { 
        time: '16:00-16:30', 
        activity: '媽咪雞蛋仔', 
        location: '佐敦', 
        transport: '步行', 
        icon: 'food',
        recommendedFood: '原味雞蛋仔、紫薯蕃薯雞蛋仔',
        description: '米其林推薦街頭小吃，外脆內軟！',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=媽咪雞蛋仔+佐敦'
      },
      { 
        time: '16:30-17:00', 
        activity: '蘭芳園', 
        location: '中環', 
        notes: '必點絲襪奶茶', 
        icon: 'food',
        recommendedFood: '絲襪奶茶、金牌豬扒包、蔥油雞扒撈丁',
        description: '絲襪奶茶始祖，中環老店非常有復古風味。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=蘭芳園+中環'
      },
      { 
        time: '17:00-18:30', 
        activity: 'PMQ 元創方', 
        location: '中環', 
        transport: '步行', 
        icon: 'sightseeing',
        description: '前已婚警察宿舍改建的文創園區，充滿設計小店與塗鴉牆。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=PMQ+元創方'
      },
      { 
        time: '18:30-19:00', 
        activity: '前往太平山', 
        location: '中環 IFC', 
        transport: '港鐵中環站 J2 → 步行', 
        icon: 'transport',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=中環交易廣場巴士總站'
      },
      { 
        time: '19:00-20:30', 
        activity: '太平山夜景', 
        location: '太平山', 
        notes: '搭小巴1號上下山', 
        icon: 'sightseeing',
        description: '世界三大夜景之一，凌霄閣摩天台視野最好。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=太平山頂'
      },
      { 
        time: '21:00-22:00', 
        activity: '坤記煲仔飯', 
        location: '上環', 
        notes: '營業到22:00', 
        icon: 'food',
        recommendedFood: '白鱔煲仔飯、臘味煲仔飯、豬骨煲',
        description: '米其林推薦，炭火現煲，鍋巴超香！',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=坤記煲仔飯'
      },
    ]
  },
  {
    day: 2,
    date: '12/13 (六)',
    title: '上環、中環、怪獸大廈',
    suggestion: '中環跟上環坡道超多，絕對要穿最好走的那雙鞋！怪獸大廈是真實居民區，拍照時請當個安靜優雅的觀光客，不要大聲喧嘩喔。',
    events: [
      { 
        time: '09:00-10:00', 
        activity: '六安居 早茶', 
        location: '上環', 
        icon: 'food',
        recommendedFood: '馬拉糕、燒賣、叉燒包',
        description: '懷舊氛圍濃厚的傳統茶樓，也是蓮香樓的姐妹店。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=六安居'
      },
      { 
        time: '10:00-11:00', 
        activity: '祥興茶行', 
        location: '上環', 
        notes: '伴手禮：鐵羅漢茶', 
        icon: 'shopping',
        description: '百年老字號茶行，鐵羅漢茶很有名。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=祥興茶行'
      },
      { 
        time: '11:00-11:30', 
        activity: 'Chicken Egg Boy', 
        location: '上環', 
        notes: '菠蘿包雞蛋仔', 
        icon: 'food',
        recommendedFood: '菠蘿包雞蛋仔',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Chicken+Egg+Boy+上環'
      },
      { 
        time: '11:30-12:30', 
        activity: '九記牛腩', 
        location: '中環', 
        icon: 'food',
        recommendedFood: '上湯牛腩麵、咖哩牛筋腩',
        description: '排隊名店，湯頭濃郁，牛肉軟嫩。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=九記牛腩'
      },
      { 
        time: '12:30-13:30', 
        activity: '勝香園', 
        location: '中環', 
        icon: 'food',
        recommendedFood: '番茄牛肉通粉、檸蜜脆脆',
        description: '就在九記對面，露天大排檔風味，蕃茄湯底一絕。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=勝香園'
      },
      { 
        time: '13:30-14:30', 
        activity: '伴手禮購物', 
        location: '中環', 
        notes: '檸檬王、珍妮曲奇', 
        icon: 'shopping',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=檸檬王'
      },
      { 
        time: '14:30-15:30', 
        activity: '下午茶：蛋塔', 
        location: '中環', 
        notes: '泰昌餅家、Bakehouse', 
        icon: 'food',
        recommendedFood: '泰昌皇牌蛋撻、Bakehouse 酸種蛋塔',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Bakehouse+Central'
      },
      { 
        time: '15:30-16:30', 
        activity: '前往怪獸大廈', 
        location: '鰂魚涌', 
        transport: '港鐵', 
        icon: 'transport',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=海山樓'
      },
      { 
        time: '16:30-17:30', 
        activity: '怪獸大廈 打卡', 
        location: '鰂魚涌', 
        notes: 'B出口', 
        icon: 'sightseeing',
        description: '變形金剛4拍攝場景，超密集住宅群，視覺震撼。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=益昌大廈'
      },
      { 
        time: '17:30-18:30', 
        activity: '前往灣仔', 
        location: '灣仔', 
        transport: '港鐵', 
        icon: 'transport',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=灣仔站'
      },
      { 
        time: '18:30-20:00', 
        activity: '晚餐：甘牌燒鵝/華姐', 
        location: '灣仔', 
        icon: 'food',
        recommendedFood: '甘牌燒鵝飯、華姐清湯腩',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=甘牌燒鵝'
      },
      { 
        time: '20:00-21:30', 
        activity: '甜點：Soft Thunder', 
        location: '灣仔', 
        icon: 'food',
        recommendedFood: '巨型蝴蝶酥 (Unicorn Puff)',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Soft+Thunder+Bakery'
      },
      { 
        time: '21:30-22:30', 
        activity: '蘭桂坊', 
        location: '中環', 
        icon: 'sightseeing',
        description: '越夜越熱鬧的酒吧街，感受西方與東方融合的夜生活。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=蘭桂坊'
      },
    ]
  },
  {
    day: 3,
    date: '12/14 (日)',
    title: '旺角、尖沙咀、維多利亞港',
    suggestion: '旺角人潮洶湧，後背包建議背前面防扒手。想看維港燈光秀建議 7:45 就先去海濱佔位置，看完可以去重慶大廈探險，但建議結伴同行！',
    events: [
      { 
        time: '08:30-10:00', 
        activity: '早餐：華星冰室/金華冰廳', 
        location: '旺角', 
        icon: 'food',
        recommendedFood: '金華冰廳菠蘿油、華星炒蛋多士',
        description: '號稱全香港最好吃的菠蘿油就在金華！',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=金華冰廳'
      },
      { 
        time: '10:00-11:30', 
        activity: '逛街：花園街/女人街', 
        location: '旺角', 
        icon: 'shopping',
        description: '波鞋街(花園街)買鞋，女人街買便宜小物。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=花園街'
      },
      { 
        time: '11:30-12:45', 
        activity: '一點心', 
        location: '太子', 
        icon: 'food',
        recommendedFood: '芒果奶黃卷、蝦餃、燒賣',
        description: '米其林平價點心，CP值超高。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=一點心'
      },
      { 
        time: '13:00-14:30', 
        activity: '澳洲牛奶公司/麥文記', 
        location: '佐敦', 
        icon: 'food',
        recommendedFood: '澳牛炒蛋、燉奶；麥文記全蝦雲吞',
        description: '澳牛以光速上餐和「個性」服務聞名，翻桌率極高。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=澳洲牛奶公司'
      },
      { 
        time: '15:00-18:00', 
        activity: '尖沙咀逛街/重慶大廈', 
        location: '尖沙咀', 
        notes: '祥興記生煎包、Hashtag B', 
        icon: 'shopping',
        description: '海港城、K11 MUSEA 都在這。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=重慶大廈'
      },
      { 
        time: '18:00-19:30', 
        activity: '妹記大排檔', 
        location: '尖沙咀', 
        icon: 'food',
        recommendedFood: '避風塘炒蟹、炸豬手、戰鬥碗啤酒',
        description: '在室內也能體驗傳統大排檔的熱鬧氣氛。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=妹記大排檔'
      },
      { 
        time: '20:00-21:30', 
        activity: '維多利亞港夜景', 
        location: '尖沙咀海濱', 
        notes: '幻彩詠香江', 
        icon: 'sightseeing',
        description: '每晚8點有燈光秀，經典香港明信片場景。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=尖沙咀海濱花園'
      },
      { 
        time: '21:30 →', 
        activity: '佳佳甜品', 
        location: '佐敦', 
        icon: 'food',
        recommendedFood: '芝麻糊、寧波湯圓、核桃露',
        description: '周潤發都愛去的中式糖水店，連續多年米其林推薦。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=佳佳甜品'
      },
    ]
  },
  {
    day: 4,
    date: '12/15 (一)',
    title: '中環、返程',
    suggestion: '最後一天了，蓮香樓這類傳統茶樓要自己找位子、看到點心車推出來要趕快去拿，「搶食」也是體驗文化的一部分！別忘了預留時間去機場。',
    events: [
      { 
        time: '08:30-09:00', 
        activity: '整理行李、退房', 
        location: '酒店', 
        notes: '行李寄放酒店', 
        icon: 'hotel',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=城景國際'
      },
      { 
        time: '09:30-10:30', 
        activity: '早餐：蓮香樓', 
        location: '中環', 
        notes: '傳統推車茶樓', 
        icon: 'food',
        recommendedFood: '豬潤燒賣、蓮蓉包、糯米雞',
        description: '百年老字號，體驗最傳統的搶籠推車飲茶文化。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=蓮香樓'
      },
      { 
        time: '10:30-11:30', 
        activity: '中環補齊伴手禮', 
        location: '中環', 
        icon: 'shopping',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=中環'
      },
      { 
        time: '11:30-12:30', 
        activity: '帝苑餅店', 
        location: '尖沙咀東', 
        notes: '蝴蝶酥', 
        icon: 'shopping',
        recommendedFood: '原味/抹茶蝴蝶酥',
        description: '香港公認最好吃的蝴蝶酥之一，非常酥脆。',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=帝苑餅店'
      },
      { 
        time: '12:30-13:30', 
        activity: '午餐：麥文記麵家', 
        location: '佐敦', 
        icon: 'food',
        recommendedFood: '全蝦雲吞、南乳豬手',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=麥文記麵家'
      },
      { 
        time: '13:30-14:00', 
        activity: '回酒店拿行李', 
        location: '油麻地', 
        icon: 'hotel',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=城景國際'
      },
      { 
        time: '14:00-15:30', 
        activity: '前往機場', 
        location: 'HKG', 
        transport: '機場快線', 
        icon: 'transport',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=香港國際機場'
      },
      { 
        time: '18:30', 
        activity: '飛機返程', 
        location: 'HKG → TPE', 
        icon: 'flight',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=TPE'
      },
    ]
  }
];

export const GENERAL_INFO: GeneralInfo = {
  flights: {
    outbound: 'CX 國泰 12/12 08:20 TPE → 10:30 HKG',
    inbound: 'CX 國泰 12/15 18:30 HKG → 20:15 TPE'
  },
  accommodation: {
    name: '城景國際',
    enName: 'The Cityview',
    location: '油麻地站',
    description: '位於九龍市中心，交通極為便利。距離地鐵站步行僅需數分鐘。',
    googleMapLink: 'https://www.google.com/maps/search/?api=1&query=The+Cityview+Hong+Kong'
  },
  tips: [
    '電壓 220V/50Hz，英式三腳 (Type G)，記得帶轉接頭。',
    '必備一雙好走的鞋！香港地鐵轉乘走路遠、中環又有斜坡。',
    '大部分餐廳不提供衛生紙和水，建議隨身攜帶面紙和水壺。',
    '手扶梯「左行右立」是潛規則，趕時間的人都走左邊。',
    '飲茶時，第一壺熱水通常是用來洗餐具的 (洗杯水)，別直接喝喔。',
    '八達通很好用！便利商店、販賣機、快餐店都能刷，餘額之後可退。',
    '想體驗在地口味可以點「茶走」(煉乳奶茶)，比絲襪奶茶更滑順。'
  ]
};

// Mock weather for Dec 12-15 2025 based on historical averages
export const WEATHER_DATA: WeatherForecast[] = [
  { date: '12/12 (五)', temp: '16°C - 21°C', condition: '晴時多雲', icon: 'sunny', humidity: '65%' },
  { date: '12/13 (六)', temp: '17°C - 22°C', condition: '多雲', icon: 'cloudy', humidity: '70%' },
  { date: '12/14 (日)', temp: '15°C - 20°C', condition: '晴朗乾燥', icon: 'sunny', humidity: '60%' },
  { date: '12/15 (一)', temp: '18°C - 23°C', condition: '偶有小雨', icon: 'rainy', humidity: '75%' },
];

export const EXCHANGE_RATE = 4.15; // 1 HKD = 4.15 TWD (Approx)