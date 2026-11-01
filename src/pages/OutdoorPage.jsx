import React, { useState } from 'react';
import { Trees, Car, Shield, Waves, Sliders, CheckCircle2 } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';

const OUTDOOR_ZONES = [
  {
    id: 'zone_garden',
    title: '🌿 สวนทิศตะวันตก 10 เมตร (~140 ตร.ม.)',
    subtitle: 'พื้นที่ว่างติดห้องนอนใหญ่ (10.00 x 14.45 ม.)',
    badge: 'โซนธรรมชาติ',
    image: './images/perspective_nordic_bright.jpg',
    specs: [
      { label: 'ขนาดพื้นที่', value: 'หน้ากว้าง 10.00 ม. x ลึก 14.45 ม.' },
      { label: 'ที่จอดรถเสริม', value: 'บล็อกหญ้า Eco Paver 3x5 ม.' },
      { label: 'แดด & ลม', value: 'แดดบ่ายทิศตะวันตก' },
      { label: 'ฟังก์ชัน', value: 'ปลูกไม้บังแดดให้ห้องนอนใหญ่' }
    ]
  },
  {
    id: 'zone_dual_gate',
    title: '🚪 ระบบประตูรั้ว 2 บาน (Dual Gate System)',
    subtitle: 'หน้ากว้าง 26.22 ม. ติดถนนสาธารณะ 8 ม.',
    badge: 'ทางเข้าหลัก',
    image: './images/perspective_dual_gate.jpg',
    specs: [
      { label: 'ประตูเลื่อนโรงรถ', value: 'กว้าง 5.20 ม. เลื่อนไปทิศตะวันออก' },
      { label: 'ประตูสวนสวิงคู่', value: 'กว้าง 3.20 ม. (บานละ 1.60 ม.)' },
      { label: 'การเปิดสวิง', value: 'สวิงเข้าสวนในมุม 90-100°' },
      { label: 'แก้ปัญหาเสาบ้าน', value: 'รถเข้าสวนได้ตรง ไม่ติดเสาโรงรถ' }
    ]
  },
  {
    id: 'zone_carport',
    title: '🚗 โรงจอดรถในร่ม 2 คัน (Carport)',
    subtitle: 'โครงสร้าง ค.ส.ล. ซุ้มโค้งโมเดิร์น',
    badge: 'หน้าบ้านฝั่งตะวันตก',
    image: './images/perspective_japandi_warm.jpg',
    specs: [
      { label: 'ขนาดโรงรถ', value: 'กว้างเสา 5.55 ม. x ลึก 6.00 ม.' },
      { label: 'ระดับพื้น', value: '+0.10 ม. จากระดับดินเดิม' },
      { label: 'งานผิว', value: 'คอนกรีตขัดหยาบ ไม่ลื่น' },
      { label: 'แสงสว่าง', value: 'ไฟดาวน์ไลท์ Warm White ซ่อนฝ้า' }
    ]
  },
  {
    id: 'zone_washing',
    title: '🧺 ลานซักล้าง & ระบบน้ำหลังบ้าน',
    subtitle: 'หันหน้าทิศใต้ รับลมมรสุมเต็มๆ',
    badge: 'งานระบบ',
    image: './images/interior_kitchen.png',
    specs: [
      { label: 'ระดับพื้น', value: '+0.10 ม. เชื่อมต่อห้องครัว' },
      { label: 'ถังเก็บน้ำ', value: 'ถังสำรองน้ำ 1,500 ลิตร' },
      { label: 'ปั๊มน้ำ', value: 'ปั๊มน้ำอัตโนมัติแรงดันคงที่' },
      { label: 'การตากผ้า', value: 'แดดบ่ายและลมใต้ ผ้าแห้งไว' }
    ]
  }
];

export default function OutdoorPage({ notes, onAddNote, currentUser }) {
  const [activeZone, setActiveZone] = useState(null);
  
  // Interactive Gate Simulator state
  const [isSlidingOpen, setIsSlidingOpen] = useState(false);
  const [isSwingOpen, setIsSwingOpen] = useState(false);

  const currentZoneNotes = activeZone 
    ? notes.filter(n => n.zoneId === activeZone.id) 
    : [];

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Site Masterplan Banner */}
      <div className="bg-stone-900 text-white p-4 rounded-3xl border border-stone-800 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">ผังพื้นที่ภายนอก 26.22 x 14.45 ม.</span>
            <h3 className="text-base font-bold">หน้าบ้านหันทิศเหนือ (ถนน 8 ม.)</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            ~95 ตร.ว.
          </span>
        </div>
        <p className="text-[11px] text-stone-300 leading-relaxed">
          แบ่งพื้นที่เป็น: สวน 10 เมตรฝั่งตะวันตก + โรงรถ 6 เมตร + ตัวบ้าน 8 เมตร และระยะร่นฝั่งตะวันออก 2 เมตร
        </p>
      </div>

      {/* Interactive 2D Dual-Gate & Site Simulator */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <span>🚪</span> ทดสอบจำลองการเปิด-ปิดประตูรั้ว 2 บาน
          </h4>
          <span className="text-[10px] text-stone-400">ระบบประตูคู่</span>
        </div>

        {/* Gate Graphic Representation */}
        <div className="bg-stone-100 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 select-none">
          <div className="flex justify-between text-[10px] text-stone-400 font-mono">
            <span>ฝั่งตะวันตก (สวน 10m)</span>
            <span>โรงรถ (6m)</span>
            <span>ฝั่งตะวันออก (10m)</span>
          </div>

          <div className="grid grid-cols-12 gap-1.5 h-16 items-center">
            {/* Garden Swing Gate (cols 1-4) */}
            <div 
              onClick={() => setIsSwingOpen(!isSwingOpen)}
              className={`col-span-4 h-full rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isSwingOpen 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                  : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              <span className="text-[10px] font-bold">ประตูสวิงคู่ 3.2m</span>
              <span className="text-[9px] opacity-80">{isSwingOpen ? '🟢 สวิงเข้าสวน' : '🔴 ปิดอยู่'}</span>
            </div>

            {/* Carport Sliding Gate (cols 5-8) */}
            <div 
              onClick={() => setIsSlidingOpen(!isSlidingOpen)}
              className={`col-span-5 h-full rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isSlidingOpen 
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 translate-x-2' 
                  : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              <span className="text-[10px] font-bold">ประตูเลื่อน 5.2m</span>
              <span className="text-[9px] opacity-80">{isSlidingOpen ? '🟢 สไลด์ไปขวา' : '🔴 ปิดอยู่'}</span>
            </div>

            {/* East Wall (cols 9-12) */}
            <div className="col-span-3 h-full rounded-xl bg-stone-200 dark:bg-stone-700/60 border border-stone-300 dark:border-stone-600 flex flex-col items-center justify-center text-center p-1">
              <span className="text-[9px] text-stone-500 dark:text-stone-300 font-semibold">กำแพงรั้วทึบ</span>
              <span className="text-[8px] text-stone-400">รางเก็บประตู</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1 text-[11px]">
            <button
              onClick={() => setIsSwingOpen(!isSwingOpen)}
              className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold active:scale-95"
            >
              สวิงเข้าสวน ({isSwingOpen ? 'ปิด' : 'เปิด'})
            </button>
            <button
              onClick={() => setIsSlidingOpen(!isSlidingOpen)}
              className="flex-1 py-1.5 rounded-xl bg-sky-600 text-white font-bold active:scale-95"
            >
              เลื่อนโรงรถ ({isSlidingOpen ? 'ปิด' : 'เปิด'})
            </button>
          </div>
        </div>
      </div>

      {/* 4 Outdoor Zones List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          🌳 รายละเอียดแต่ละโซนภายนอก (แตะเพื่อดูสเปก & ใส่โน้ต)
        </h4>

        <div className="space-y-2.5">
          {OUTDOOR_ZONES.map((zone) => (
            <div
              key={zone.id}
              onClick={() => setActiveZone(zone)}
              className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 cursor-pointer transition-all active:scale-98 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {zone.badge}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">{zone.subtitle}</span>
              </div>

              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                {zone.title}
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                {zone.specs.slice(0, 2).map((s, idx) => (
                  <div key={idx} className="bg-stone-50 dark:bg-stone-800 p-2 rounded-xl">
                    <span className="text-[9px] text-stone-400 block">{s.label}</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet Drawer for Zone Details */}
      <BottomSheet
        isOpen={!!activeZone}
        onClose={() => setActiveZone(null)}
        title={activeZone?.title}
        subtitle={activeZone?.subtitle}
        badge={activeZone?.badge}
        image={activeZone?.image}
        specs={activeZone?.specs}
        notes={currentZoneNotes}
        currentUser={currentUser}
        onAddNote={(newNote) => {
          onAddNote({
            ...newNote,
            pageId: 'page3',
            zoneId: activeZone.id
          });
        }}
      />

    </div>
  );
}
