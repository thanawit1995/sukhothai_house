import React, { useState } from 'react';
import { Eye, Layers, Sparkles, Compass } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';

const HOTSPOTS = [
  {
    id: 'hp_porch',
    number: '1',
    x: 52, // % from left
    y: 60, // % from top
    title: 'ซุ้มเฉลียงทางเข้าหน้าบ้าน (Arched Porch)',
    subtitle: 'เฉลียงยกระดับ +0.40 ม.',
    badge: 'ดีไซน์เด่น',
    image: './images/exterior_facade.png',
    specs: [
      { label: 'ขนาดเฉลียง', value: '3.40 x 1.30 ม.' },
      { label: 'ระดับพื้น', value: '+0.40 ม. (บันได 2 ขั้น)' },
      { label: 'ผิวสัมผัส', value: 'แกรนิตโต้กันลื่น R10' },
      { label: 'แสงสว่าง', value: 'โคมไฟกิ่ง Warm White 3000K' }
    ]
  },
  {
    id: 'hp_roof',
    number: '2',
    x: 48,
    y: 28,
    title: 'หลังคาปั้นหยา SCG ลอนเอลาบานา 25°',
    subtitle: 'ระดับสันหลังคา +6.18 ม.',
    badge: 'โครงสร้างหลัก',
    image: './images/perspective_nordic_bright.jpg',
    specs: [
      { label: 'ชนิดกระเบื้อง', value: 'SCG ลอนเอลาบานา' },
      { label: 'สีหลังคา', value: 'เทาแทนทาลัม (Tantalum Grey)' },
      { label: 'ความลาดชัน', value: '25 องศา ระบายน้ำไว' },
      { label: 'ฉนวนกันร้อน', value: 'Stay Cool 75-150 มม.' }
    ]
  },
  {
    id: 'hp_window',
    number: '3',
    x: 75,
    y: 56,
    title: 'หน้าต่างซุ้มโค้ง Arch ห้องนอน 2 (หน้าบ้าน)',
    subtitle: 'รับแดดเช้าทิศตะวันออก',
    badge: 'เอกลักษณ์นอร์ดิก',
    image: './images/interior_bedroom.png',
    specs: [
      { label: 'จำนวนช่องแสง', value: 'บานโค้ง 3 บานเรียงกัน' },
      { label: 'กรอบเฟรม', value: 'อลูมิเนียมลายไม้ / ขาวคลีน' },
      { label: 'กระจก', value: 'กระจกเขียวตัดแสง 6 มม.' },
      { label: 'ทิศทาง', value: 'ทิศเหนือ ไม่โดนแดดบ่าย' }
    ]
  },
  {
    id: 'hp_carport',
    number: '4',
    x: 22,
    y: 58,
    title: 'โรงจอดรถในร่ม 2 คัน (Carport)',
    subtitle: 'เสาช่วงกว้าง 5.55 ม.',
    badge: 'ทิศตะวันตก',
    image: './images/perspective_dual_gate.jpg',
    specs: [
      { label: 'ความกว้างเสา', value: '5.55 เมตร จอด 2 คันสบาย' },
      { label: 'ระดับพื้น', value: '+0.10 ม. (ค.ส.ล. ขัดหยาบ)' },
      { label: 'แนวสโลป', value: 'เทลาดออกหน้ารั้ว 1:50' },
      { label: 'ซุ้มโค้ง', value: 'ซุ้ม Arch คู่กว้างขวาง' }
    ]
  },
  {
    id: 'hp_gate',
    number: '5',
    x: 25,
    y: 82,
    title: 'ประตูเลื่อนโรงรถ 5.20 ม. (Sliding Gate)',
    subtitle: 'เลื่อนเก็บไปทางทิศตะวันออก',
    badge: 'แบบขยาย A-807',
    image: './images/perspective_dual_gate.jpg',
    specs: [
      { label: 'ความกว้างบาน', value: '5.20 เมตร (ตามแนวโรงรถ)' },
      { label: 'ทิศทางสไลด์', value: 'สไลด์เปิดไปทางทิศตะวันออก' },
      { label: 'ระบบล้อ', value: 'ล้อคู่ Twin Roller 3 นิ้ว' },
      { label: 'ดีไซน์', value: 'ระแนงไม้สว่าง/ดำด้าน @7.5 ซม.' }
    ]
  }
];

export default function HouseModelPage({ notes, onAddNote, currentUser }) {
  const [currentView, setCurrentView] = useState('nordic'); // 'nordic' | 'japandi' | 'facade'
  const [activeHotspot, setActiveHotspot] = useState(null);

  const viewImages = {
    nordic: {
      url: './images/perspective_nordic_bright.jpg',
      label: '❄️ นอร์ดิกสว่าง ละมุนตา',
      desc: 'แสงเช้าธรรมชาติ ผนังขาวชอล์ก ระแนงไม้บลอนด์อ่อน สะอาดตา'
    },
    japandi: {
      url: './images/perspective_japandi_warm.jpg',
      label: '✨ โมเดิร์น Japandi อบอุ่น',
      desc: 'แสงเย็น Golden Hour ไฟ Warm White 3000K ผนังครีมหรูหรา'
    },
    facade: {
      url: './images/exterior_facade.png',
      label: '📐 รูปด้านสถาปัตย์ 3D',
      desc: 'มุมมองตรงระนาบตามแบบก่อสร้าง มาตราส่วนจริง'
    }
  };

  const handleOpenHotspot = (hp) => {
    setActiveHotspot(hp);
  };

  const currentHotspotNotes = activeHotspot 
    ? notes.filter(n => n.zoneId === activeHotspot.id) 
    : [];

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* View Switcher Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {Object.entries(viewImages).map(([key, view]) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all active:scale-95 ${
              currentView === key 
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm font-bold' 
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Main Interactive Model Viewport (Zero-clutter design) */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md bg-stone-950 aspect-[16/10] select-none">
        <img 
          src={viewImages[currentView].url} 
          alt={viewImages[currentView].label} 
          className="w-full h-full object-cover"
        />

        {/* Minimal Pulsing Numbered Pins */}
        {HOTSPOTS.map((hp) => (
          <button
            key={hp.id}
            onClick={() => handleOpenHotspot(hp)}
            style={{ left: `${hp.x}%`, top: `${hp.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10"
            aria-label={hp.title}
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              {/* Pulsing ring */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              {/* Solid pin */}
              <span className="relative inline-flex items-center justify-center rounded-full h-6 w-6 bg-amber-500 text-stone-950 text-xs font-black shadow-lg border-2 border-white">
                {hp.number}
              </span>
            </span>
          </button>
        ))}

        {/* Tip hint at bottom of image */}
        <div className="absolute bottom-2 inset-x-3 text-center pointer-events-none">
          <span className="text-[10px] bg-stone-950/70 text-stone-300 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
            แตะที่จุด ① ② ③ เพื่อดูสเปกและแปะโน้ตเฉพาะจุด
          </span>
        </div>
      </div>

      {/* View Description */}
      <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs space-y-1">
        <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
          <span>{viewImages[currentView].label}</span>
          <span className="text-[10px] text-stone-400">หันหน้าทิศเหนือ</span>
        </div>
        <p className="text-stone-500 text-[11px] leading-relaxed">
          {viewImages[currentView].desc}
        </p>
      </div>

      {/* Quick Summary of Key Architectural Features */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          🔍 จุดเด่นสถาปัตยกรรม (แตะเพื่อเปิดดู)
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {HOTSPOTS.map(hp => (
            <button
              key={hp.id}
              onClick={() => handleOpenHotspot(hp)}
              className="text-left p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 active:scale-98 transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-[10px]">
                  {hp.number}
                </span>
                <span className="text-[9px] text-stone-400">{hp.badge}</span>
              </div>
              <p className="font-bold text-stone-800 dark:text-stone-200 truncate text-[11px]">
                {hp.title.split('(')[0]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      <BottomSheet
        isOpen={!!activeHotspot}
        onClose={() => setActiveHotspot(null)}
        title={activeHotspot?.title}
        subtitle={activeHotspot?.subtitle}
        badge={activeHotspot?.badge}
        image={activeHotspot?.image}
        specs={activeHotspot?.specs}
        notes={currentHotspotNotes}
        currentUser={currentUser}
        onAddNote={(newNote) => {
          onAddNote({
            ...newNote,
            pageId: 'page2',
            zoneId: activeHotspot.id
          });
        }}
      />

    </div>
  );
}
