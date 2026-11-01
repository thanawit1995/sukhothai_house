import React, { useState } from 'react';
import { LayoutGrid, Armchair, Utensils, ChefHat, BedDouble, Bed, Bath } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';

const INDOOR_ROOMS = [
  {
    id: 'room_living',
    title: 'โถงรับแขก & นั่งเล่น (Living Area)',
    subtitle: 'เพดานสูง 3.00 ม. โปร่งโล่ง',
    badge: 'โซนต้อนรับ',
    icon: Armchair,
    image: './images/interior_living.png',
    dimensions: '4.00 x 4.40 ม. (17.6 ตร.ม.)',
    floor: 'แกรนิตโต้ 60x60 ซม. ครีมลายหินอ่อน (F1)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 4.40 เมตร' },
      { label: 'ความสูงฝ้า', value: '3.00 เมตร โปร่งโล่ง' },
      { label: 'วัสดุพื้น', value: 'แกรนิตโต้ 60x60 ซม. (F1)' },
      { label: 'ผนังตกแต่ง', value: 'ระแนงไม้ WPC ผนังทีวี (W4)' }
    ]
  },
  {
    id: 'room_dining',
    title: 'โซนทานอาหาร (Dining Area)',
    subtitle: 'เชื่อมต่อห้องนั่งเล่นแบบ Open-Plan',
    badge: 'ครอบครัว',
    icon: Utensils,
    image: './images/interior_dining.png',
    dimensions: '4.00 x 3.00 ม. (12.0 ตร.ม.)',
    floor: 'แกรนิตโต้ 60x60 ซม. (F1)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 3.00 เมตร' },
      { label: 'ความจุ', value: 'โต๊ะทานอาหาร 6 ที่นั่ง' },
      { label: 'ทางเชื่อม', value: 'ซุ้มโค้ง Archway ไปห้องนอน' },
      { label: 'แสงสว่าง', value: 'โคมไฟแขวนสไตล์นอร์ดิก' }
    ]
  },
  {
    id: 'room_kitchen',
    title: 'ห้องครัวปิด (Enclosed Kitchen)',
    subtitle: 'ประตูกระจกบานเลื่อนกั้นกลิ่นอาหาร',
    badge: 'ทำอาหารหนัก',
    icon: ChefHat,
    image: './images/interior_kitchen.png',
    dimensions: '4.00 x 2.50 ม. (10.0 ตร.ม.)',
    floor: 'แกรนิตโต้กันลื่น 60x60 ซม. (F2)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 2.50 เมตร' },
      { label: 'เคาน์เตอร์', value: 'เคาน์เตอร์ปูนกรุกระเบื้อง' },
      { label: 'การระบายกลิ่น', value: 'หน้าต่าง 2 ด้าน + พัดลมดูด' },
      { label: 'ประตูหลังบ้าน', value: 'เปิดออกสู่ลานซักล้าง' }
    ]
  },
  {
    id: 'room_master',
    title: 'ห้องนอนใหญ่ (Master Bedroom)',
    subtitle: 'ห้องน้ำในตัว ทิศตะวันตกติดสวน',
    badge: 'ห้องนอนหลัก',
    icon: BedDouble,
    image: './images/interior_master.png',
    dimensions: '4.30 x 3.50 ม. (15.05 ตร.ม.)',
    floor: 'ไม้พื้นไวนิล SPC Click-lock 4 มม. (F4)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.30 x 3.50 เมตร' },
      { label: 'ห้องน้ำในตัว', value: 'ขนาด 1.70 x 3.00 ม. (ครบชุด)' },
      { label: 'วัสดุพื้น', value: 'ไวนิล SPC 4mm นุ่มเท้า กันน้ำ' },
      { label: 'การบังแดด', value: 'แนวต้นไม้สวน 10 ม. ช่วยกรองแดด' }
    ]
  },
  {
    id: 'room_bed2',
    title: 'ห้องนอน 2 ซุ้มโค้ง (Bedroom 2)',
    subtitle: 'ห้องนอนหน้าบ้าน หน้าต่างโค้ง 3 บาน',
    badge: 'วิวหน้าบ้าน',
    icon: Bed,
    image: './images/interior_bedroom.png',
    dimensions: '4.00 x 4.40 ม. (17.6 ตร.ม.)',
    floor: 'ไม้พื้นไวนิล SPC Click-lock 4 มม. (F4)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 4.40 เมตร (กว้างขวาง)' },
      { label: 'ช่องแสง', value: 'หน้าต่างซุ้มโค้ง 3 บานติดกัน' },
      { label: 'ทิศทางแดด', value: 'แดดเช้าทิศตะวันออก ห้องเย็นสบาย' },
      { label: 'ความสูงฝ้า', value: '3.00 เมตร โปร่งโล่ง' }
    ]
  },
  {
    id: 'room_bed1',
    title: 'ห้องนอน 1 / ทำงาน (Bedroom 1)',
    subtitle: 'ห้องนอนหลังบ้านฝั่งตะวันออก',
    badge: 'อเนกประสงค์',
    icon: Bed,
    image: './images/interior_dining.png',
    dimensions: '4.00 x 3.50 ม. (14.0 ตร.ม.)',
    floor: 'ไม้พื้นไวนิล SPC Click-lock 4 มม. (F4)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 3.50 เมตร' },
      { label: 'ฟังก์ชันแปรผัน', value: 'ห้องนอนแขก / Home Office' },
      { label: 'หน้าต่าง', value: 'เปิดรับลมทิศใต้และตะวันออก' },
      { label: 'ความเงียบ', value: 'โซนส่วนตัวหลังบ้าน' }
    ]
  },
  {
    id: 'room_bath2',
    title: 'ห้องน้ำส่วนกลาง (Common Bath)',
    subtitle: 'คั่นกลางระหว่างห้องนอน 1 และ 2',
    badge: 'แยกเปียก-แห้ง',
    icon: Bath,
    image: './images/interior_master.png',
    dimensions: '1.70 x 2.40 ม. (4.08 ตร.ม.)',
    floor: 'กระเบื้องแกรนิตโต้กันลื่น R10 (F2)',
    specs: [
      { label: 'ขนาดห้อง', value: '1.70 x 2.40 เมตร' },
      { label: 'ผนังกรุ', value: 'กระเบื้องแกรนิตโต้จรดฝ้า' },
      { label: 'ฝ้าเพดาน', value: 'ยิปซั่มบอร์ดชนิดทนชื้น (C2)' },
      { label: 'การระบายอากาศ', value: 'ช่องเกล็ดระบายอากาศติดมุ้งลวด' }
    ]
  }
];

export default function IndoorPage({ notes, onAddNote, currentUser }) {
  const [activeRoom, setActiveRoom] = useState(null);

  const currentRoomNotes = activeRoom 
    ? notes.filter(n => n.zoneId === activeRoom.id) 
    : [];

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Floorplan Banner */}
      <div className="bg-stone-900 text-white p-4 rounded-3xl border border-stone-800 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">ผังพื้นที่ภายใน 102.80 ตร.ม.</span>
            <h3 className="text-base font-bold">บ้านเดี่ยว 1 ชั้น 3 นอน 2 น้ำ</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            ฝ้าสูง 3.00 ม.
          </span>
        </div>
        <p className="text-[11px] text-stone-300 leading-relaxed">
          แยกสัดส่วนชัดเจน: ปีกตะวันออก (ห้องนอน 1 & 2), กลางบ้าน (นั่งเล่น & ทานอาหาร), ปีกตะวันตก (โรงรถ & Master Bedroom)
        </p>
      </div>

      {/* 7 Rooms Navigation Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          🛋️ เลือกห้องเพื่อดูสเปก & แปะโน้ตบิวท์อิน
        </h4>

        <div className="space-y-2.5">
          {INDOOR_ROOMS.map((room) => {
            const Icon = room.icon;
            const roomNotesCount = notes.filter(n => n.zoneId === room.id).length;

            return (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 cursor-pointer transition-all active:scale-98 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                        {room.title}
                      </h4>
                      <span className="text-[10px] text-stone-400">{room.dimensions}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                    {roomNotesCount > 0 ? `${roomNotesCount} โน้ต` : room.badge}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 bg-stone-50 dark:bg-stone-800/60 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate">พื้น: {room.floor}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold text-[10px] shrink-0 ml-2">แตะดูรูป ➡️</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sheet Drawer for Room Details */}
      <BottomSheet
        isOpen={!!activeRoom}
        onClose={() => setActiveRoom(null)}
        title={activeRoom?.title}
        subtitle={activeRoom?.dimensions}
        badge={activeRoom?.badge}
        image={activeRoom?.image}
        specs={activeRoom?.specs}
        notes={currentRoomNotes}
        currentUser={currentUser}
        onAddNote={(newNote) => {
          onAddNote({
            ...newNote,
            pageId: 'page4',
            zoneId: activeRoom.id
          });
        }}
      />

    </div>
  );
}
