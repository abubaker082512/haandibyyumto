const fs = require('fs');
const parsed = JSON.parse(fs.readFileSync('C:/Users/abuba/.gemini/antigravity/brain/abfb73f6-9154-4e16-ab89-c9fecf9fb1a3/scratch/scraper/parsed_items.json'));

let menuStr = parsed.map(m => {
  const price = m.price || 0;
  return `    MenuItem(id: '${m.id}', name: '${m.name.replace(/'/g, "\\'")}', price: ${price}, description: '${(m.description || '').replace(/'/g, "\\'")}', category: '${m.category}', imageUrl: '${m.imageUrl}', isAvailable: true, branchesAvailable: ['br-lhr']),`;
}).join('\n');

const newDb = `import 'models.dart';

class MockDatabase {
  static final MockDatabase _instance = MockDatabase._internal();
  factory MockDatabase() => _instance;
  MockDatabase._internal();

  List<UserProfile> users = [
    UserProfile(id: 'u-cust', name: 'Abubakar Customer', phone: '+92 300 1234567', role: 'CUSTOMER'),
    UserProfile(id: 'u-man1', name: 'Asim Manager', phone: '+92 321 9876543', role: 'MANAGER', branchId: 'br-lhr'),
    UserProfile(id: 'u-kit1', name: 'Chef Tariq', phone: '+92 312 3456789', role: 'KITCHEN', branchId: 'br-lhr'),
    UserProfile(id: 'u-ride1', name: 'Zahid Rider 1', phone: '+92 345 6789012', role: 'RIDER'),
  ];

  List<Branch> branches = [
    Branch(
      id: 'br-lhr',
      name: 'Yumto Mandi - M.M. Alam Rd',
      city: 'Lahore',
      address: '24-K, M.M. Alam Road',
      phone: '+92 42 35789000',
      premiumBookingFee: 1500,
      activeSurchargeToggle: true,
    ),
  ];

  List<Floor> floors = [
    Floor(id: 'fl-lhr-g', branchId: 'br-lhr', name: 'Ground Floor (General)', level: 0),
    Floor(id: 'fl-lhr-1', branchId: 'br-lhr', name: 'First Floor (Family Section)', level: 1),
    Floor(id: 'fl-lhr-2', branchId: 'br-lhr', name: 'Second Floor (VIP Majlis Suite)', level: 2),
  ];

  List<AppTable> tables = [
    AppTable(id: 'tb-g1', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-1', capacity: 4, type: 'STANDARD', x: 50, y: 50, width: 25, height: 10, status: 'AVAILABLE'),
    AppTable(id: 'tb-g2', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-2', capacity: 4, type: 'STANDARD', x: 150, y: 50, width: 25, height: 10, status: 'AVAILABLE'),
    AppTable(id: 'tb-g3', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-3', capacity: 2, type: 'STANDARD', x: 250, y: 50, width: 20, height: 10, status: 'OCCUPIED'),
    AppTable(id: 'tb-g4', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-4', capacity: 8, type: 'STANDARD', x: 50, y: 150, width: 45, height: 10, status: 'AVAILABLE'),
    AppTable(id: 'tb-g5', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-5', capacity: 4, type: 'STANDARD', x: 150, y: 150, width: 25, height: 10, status: 'RESERVED'),
    AppTable(id: 'tb-g6', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-6', capacity: 4, type: 'STANDARD', x: 250, y: 150, width: 25, height: 10, status: 'AVAILABLE'),
  ];

  List<MenuItem> menu = [
${menuStr}
  ];
}
`;

fs.writeFileSync('d:/Yumto Mandi/flutter_apps/yumto_core/lib/mock_db.dart', newDb);
