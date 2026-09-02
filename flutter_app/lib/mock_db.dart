import 'models.dart';

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
  ];

  List<AppTable> tables = [
    AppTable(id: 'tb-g1', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-1', capacity: 4, type: 'STANDARD', x: 15, y: 15, width: 14, height: 12, status: 'AVAILABLE'),
    AppTable(id: 'tb-g3', floorId: 'fl-lhr-g', branchId: 'br-lhr', tableNumber: 'T-3', capacity: 2, type: 'STANDARD', x: 75, y: 15, width: 12, height: 10, status: 'OCCUPIED'),
  ];

  List<MenuItem> menu = [
    MenuItem(
      id: 'm1',
      name: 'Hummus',
      price: 890,
      description: 'Classic hummus',
      category: 'Appetizers',
      imageUrl: 'https://assets.indolj.io/upload/1741986261-hummus.jpg',
      isAvailable: true,
      branchesAvailable: ['br-lhr'],
    ),
    MenuItem(
      id: 'm14',
      name: 'Chicken Mandi',
      price: 1990,
      description: 'Traditional Chicken Mandi',
      category: 'Mandi',
      imageUrl: 'https://assets.indolj.io/upload/1741985834-mandi.jpg',
      isAvailable: true,
      branchesAvailable: ['br-lhr'],
    ),
  ];
}
