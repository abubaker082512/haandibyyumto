import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:yumto_core/yumto_core.dart';
import '../providers/cart_provider.dart';
import 'home_screen.dart';
import 'table_selection_screen.dart';

class LocationScreen extends StatefulWidget {
  const LocationScreen({super.key});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  final db = MockDatabase();
  String? selectedCity = 'Rawalpindi';
  String? selectedBranchId;

  @override
  void initState() {
    super.initState();
    if (db.branches.isNotEmpty) {
      selectedBranchId = db.branches.first.id;
    }
  }

  @override
  Widget build(BuildContext context) {
    final orderType = context.read<CartProvider>().orderType;
    
    return Scaffold(
      body: Stack(
        children: [
          // Mock Map Background
          Container(
            color: Colors.blueGrey[900],
            child: const Center(
              child: Icon(Icons.map, size: 200, color: Colors.white12),
            ),
          ),
          Positioned(
            top: 50,
            left: 16,
            child: InkWell(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.arrow_back_ios_new, color: Color(0xFFFACC15)),
              ),
            ),
          ),
          // Bottom Sheet
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFF1F2937),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Please select your ${orderType?.toLowerCase()} location',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // City Dropdown
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white54),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedCity,
                        isExpanded: true,
                        dropdownColor: const Color(0xFF1F2937),
                        style: const TextStyle(color: Colors.white),
                        items: ['Lahore', 'Rawalpindi'].map((c) {
                          return DropdownMenuItem(value: c, child: Text(c));
                        }).toList(),
                        onChanged: (val) {
                          setState(() => selectedCity = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Branch Dropdown
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white54),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedBranchId,
                        isExpanded: true,
                        dropdownColor: const Color(0xFF1F2937),
                        style: const TextStyle(color: Colors.white),
                        items: db.branches.map((b) {
                          return DropdownMenuItem(value: b.id, child: Text(b.name));
                        }).toList(),
                        onChanged: (val) {
                          setState(() => selectedBranchId = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFACC15),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        if (selectedBranchId != null) {
                          final bName = db.branches.firstWhere((b) => b.id == selectedBranchId).name;
                          context.read<CartProvider>().setLocation(selectedBranchId!, bName);
                          
                          if (orderType == 'Dine-In') {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (_) => const TableSelectionScreen()),
                            );
                          } else {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (_) => const HomeScreen()),
                            );
                          }
                        }
                      },
                      child: const Text(
                        'Confirm Location',
                        style: TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
