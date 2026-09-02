class UserProfile {
  final String id;
  final String name;
  final String phone;
  final String role;
  final String? branchId;

  UserProfile({required this.id, required this.name, required this.phone, required this.role, this.branchId});
}

class Branch {
  final String id;
  final String name;
  final String city;
  final String address;
  final String phone;
  final int premiumBookingFee;
  final bool activeSurchargeToggle;

  Branch({required this.id, required this.name, required this.city, required this.address, required this.phone, required this.premiumBookingFee, required this.activeSurchargeToggle});
}

class Floor {
  final String id;
  final String branchId;
  final String name;
  final int level;

  Floor({required this.id, required this.branchId, required this.name, required this.level});
}

class AppTable {
  final String id;
  final String floorId;
  final String branchId;
  final String tableNumber;
  final int capacity;
  final String type; // 'STANDARD' | 'MAJLIS_FLOOR' | 'VIP_CABIN'
  final int x;
  final int y;
  final int width;
  final int height;
  final String status; // 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'

  AppTable({required this.id, required this.floorId, required this.branchId, required this.tableNumber, required this.capacity, required this.type, required this.x, required this.y, required this.width, required this.height, required this.status});
}

class MenuItem {
  final String id;
  final String name;
  final double price;
  final String description;
  final String category;
  final String imageUrl;
  final bool isAvailable;
  final List<String> branchesAvailable;

  MenuItem({required this.id, required this.name, required this.price, required this.description, required this.category, required this.imageUrl, required this.isAvailable, required this.branchesAvailable});
}
