'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Globe,
  Warehouse,
  Users,
  FolderKanban,
  Package,
  FileSpreadsheet,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';

type MenuItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type MenuItemOrSection = MenuItem | MenuSection;

const menuItems: MenuItemOrSection[] = [
  {
    title: 'ダッシュボード',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'マスタ管理',
    items: [
      { title: 'カートマスタ', href: '/cart-master', icon: ShoppingCart },
      { title: 'ECサイトマスタ', href: '/ec-site-master', icon: Globe },
      { title: 'WMSマスタ', href: '/wms-master', icon: Warehouse },
      { title: 'クライアントマスタ', href: '/client-master', icon: Users },
      { title: '案件マスタ', href: '/project-master', icon: FolderKanban },
      { title: '商品マスタ', href: '/product-master', icon: Package },
    ],
  },
  {
    title: 'データ登録',
    items: [
      { title: '商品CSV登録', href: '/product-csv', icon: FileSpreadsheet },
      { title: 'WMS出荷実績登録', href: '/shipment-records', icon: FileSpreadsheet },
    ],
  },
  {
    title: '売上報告',
    href: '/sales-report',
    icon: TrendingUp,
  },
];

function isMenuSection(item: MenuItemOrSection): item is MenuSection {
  return 'items' in item;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Link href="/">
          <h1 className="text-xl font-bold">サイテキシステム</h1>
          <p className="text-xs text-gray-400 mt-1">Data Integration Platform</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            if (isMenuSection(item)) {
              // Section with sub-items
              return (
                <li key={index} className="mb-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {item.title}
                  </div>
                  <ul className="space-y-1">
                    {item.items.map((subItem) => {
                      const Icon = subItem.icon;
                      const isActive = pathname === subItem.href;
                      return (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm">{subItem.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            } else {
              // Single item
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </li>
              );
            }
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">© 2025 サイテキシステム</p>
      </div>
    </aside>
  );
}
