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

  final List<Map<String, dynamic>> sectors = const [
    {'name': 'Civic Center (Gulberg Greens)', 'dist': '0.2 km', 'valid': true},
    {'name': 'Executive Block (Gulberg Greens)', 'dist': '0.4 km', 'valid': true},
    {'name': 'Block A (Gulberg Greens)', 'dist': '0.9 km', 'valid': true},
    {'name': 'Block B (Gulberg Greens)', 'dist': '1.4 km', 'valid': true},
    {'name': 'Block C (Gulberg Greens)', 'dist': '1.9 km', 'valid': true},
    {'name': 'Outside Gulberg (> 2.5 km - Not Eligible)', 'dist': '4.8 km', 'valid': false},
  ];

  late String selectedSector;

  @override
  void initState() {
    super.initState();
    selectedSector = sectors.first['name'];
  }

  @override
  Widget build(BuildContext context) {
    final orderType = context.read<CartProvider>().orderType;
    final currentSec = sectors.firstWhere((s) => s['name'] == selectedSector);
    final isValidDelivery = currentSec['valid'] as bool;

    return Scaffold(
      backgroundColor: const Color(0xFF1A120B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A120B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          '$orderType Location',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: Column(
        children: [
          // Live OpenStreetMap preview
          Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFEADBCC)),
              ),
              clipBehavior: Clip.antiAlias,
              child: const LiveTrackingMapWidget(
                destinationSector: 'Gulberg Greens, Islamabad',
                height: double.infinity,
              ),
            ),
          ),

          // Sector & Location Selector Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFFFBF8F3),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 16,
                  offset: Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Branch Badge
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8B1E1E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.storefront, color: Color(0xFF8B1E1E), size: 20),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Haandi by Yumto — Islamabad',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1A120B)),
                            ),
                            Text(
                              'Civic Center, Executive Block, Gulberg Greens',
                              style: TextStyle(fontSize: 11, color: Color(0xFF6B5B4C)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Sector Dropdown for Delivery
                  if (orderType == 'Delivery') ...[
                    const Text(
                      'Select Delivery Sector (Max 2.5 km):',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF4B3E32)),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(
                          color: isValidDelivery ? const Color(0xFFEADBCC) : const Color(0xFFEF4444),
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedSector,
                          isExpanded: true,
                          style: const TextStyle(fontSize: 13, color: Color(0xFF1A120B), fontWeight: FontWeight.w600),
                          items: sectors.map((s) {
                            return DropdownMenuItem<String>(
                              value: s['name'],
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      s['name'],
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    s['dist'],
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: s['valid'] ? const Color(0xFF15803D) : const Color(0xFFDC2626),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => selectedSector = val);
                          },
                        ),
                      ),
                    ),
                    if (!isValidDelivery) ...[
                      const SizedBox(height: 6),
                      const Text(
                        '⚠ We currently deliver strictly within 2.5 km of Civic Center.',
                        style: TextStyle(color: Color(0xFFDC2626), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                    const SizedBox(height: 16),
                  ],

                  // Confirm Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (orderType == 'Delivery' && !isValidDelivery)
                          ? null
                          : () {
                              context.read<CartProvider>().setLocation('br-isb', 'Haandi Gulberg Greens');
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
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B1E1E),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        disabledBackgroundColor: Colors.grey[400],
                      ),
                      child: Text(
                        orderType == 'Dine-In' ? 'Choose Table & Reserve' : 'Browse Haandi Menu',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
