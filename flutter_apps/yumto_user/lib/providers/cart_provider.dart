import 'package:flutter/material.dart';
import 'package:yumto_core/yumto_core.dart';

class CartItem {
  final MenuItem item;
  int quantity;

  CartItem({required this.item, this.quantity = 1});
}

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  String? _orderType; // 'Delivery', 'Pickup', 'Dine-In'
  String? _branchId;
  String? _branchName;
  String? _tableId;

  List<CartItem> get items => _items;
  String? get orderType => _orderType;
  String? get branchId => _branchId;
  String? get branchName => _branchName;
  String? get tableId => _tableId;

  int get itemCount => _items.fold(0, (total, current) => total + current.quantity);
  double get totalAmount => _items.fold(0.0, (total, current) => total + (current.item.price * current.quantity));

  void setOrderType(String type) {
    _orderType = type;
    notifyListeners();
  }

  void setLocation(String bId, String bName) {
    _branchId = bId;
    _branchName = bName;
    notifyListeners();
  }

  void setTable(String tId) {
    _tableId = tId;
    notifyListeners();
  }

  void addItem(MenuItem item) {
    final existingIndex = _items.indexWhere((i) => i.item.id == item.id);
    if (existingIndex >= 0) {
      _items[existingIndex].quantity += 1;
    } else {
      _items.add(CartItem(item: item));
    }
    notifyListeners();
  }

  void removeItem(String itemId) {
    _items.removeWhere((i) => i.item.id == itemId);
    notifyListeners();
  }
  
  void updateQuantity(String itemId, int quantity) {
    final existingIndex = _items.indexWhere((i) => i.item.id == itemId);
    if (existingIndex >= 0) {
      if (quantity <= 0) {
        _items.removeAt(existingIndex);
      } else {
        _items[existingIndex].quantity = quantity;
      }
      notifyListeners();
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
