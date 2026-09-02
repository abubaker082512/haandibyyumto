import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:yumto_core/yumto_core.dart';
import '../providers/cart_provider.dart';
import 'home_screen.dart';

class TableSelectionScreen extends StatefulWidget {
  const TableSelectionScreen({super.key});

  @override
  State<TableSelectionScreen> createState() => _TableSelectionScreenState();
}

class _TableSelectionScreenState extends State<TableSelectionScreen> {
  final db = MockDatabase();
  String? selectedTableId;
  String selectedFloorId = 'fl-lhr-g';

  @override
  Widget build(BuildContext context) {
    final floorTables = db.tables.where((t) => t.floorId == selectedFloorId).toList();
    final selectedTable = selectedTableId != null
        ? db.tables.firstWhere((t) => t.id == selectedTableId, orElse: () => db.tables.first)
        : null;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Reserve a Table',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        backgroundColor: const Color(0xFFFACC15),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Date / Time / Guests Strip
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
              child: Row(
                children: [
                  Expanded(child: _buildInputCard('DATE', '31/08/2026', Icons.calendar_today)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildInputCard('TIME', '08:30 pm', Icons.access_time)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildInputCard('GUESTS', '4 Guests', Icons.people_outline)),
                ],
              ),
            ),

            // Floor Selection Label
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 6, 16, 6),
              child: Text(
                'FLOOR',
                style: TextStyle(
                  color: Color(0xFF6B7280),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ),

            // Floor Selector Tabs
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: db.floors.map((floor) {
                  final isSelected = selectedFloorId == floor.id;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        selectedFloorId = floor.id;
                        selectedTableId = null;
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFF9FAFB),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFE5E7EB),
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        floor.name,
                        style: TextStyle(
                          color: isSelected ? Colors.white : const Color(0xFF374151),
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 12),

            // Blueprint Floor Plan Container
            Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B1329), // Deep dark navy blueprint background
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: const Color(0xFFFACC15).withOpacity(0.4),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: Stack(
                    children: [
                      // Subtle blueprint grid
                      Positioned.fill(
                        child: CustomPaint(painter: GridPainter()),
                      ),

                      // Legend Bar
                      Positioned(
                        top: 10,
                        left: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.55),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white12),
                          ),
                          child: Row(
                            children: [
                              _buildLegendBadge(const Color(0xFF10B981), 'Available'),
                              const SizedBox(width: 8),
                              _buildLegendBadge(const Color(0xFFF59E0B), 'Reserved'),
                              const SizedBox(width: 8),
                              _buildLegendBadge(const Color(0xFFEC4899), 'Occupied'),
                              const Spacer(),
                              if (selectedTable != null)
                                Text(
                                  '✓ ${selectedTable.tableNumber}',
                                  style: const TextStyle(
                                    color: Color(0xFFFACC15),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),

                      // Interactive Floor Plan
                      Positioned.fill(
                        top: 44,
                        bottom: 8,
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final w = constraints.maxWidth;
                            final h = constraints.maxHeight;

                            return Stack(
                              children: floorTables.map((table) {
                                final isSelected = selectedTableId == table.id;
                                final isAvailable = table.status == 'AVAILABLE';

                                Color bgColor;
                                Color borderColor;
                                Color textColor;

                                if (isSelected) {
                                  bgColor = const Color(0xFFFACC15); // Brand Yellow
                                  borderColor = Colors.black;
                                  textColor = Colors.black;
                                } else {
                                  switch (table.status) {
                                    case 'AVAILABLE':
                                      bgColor = const Color(0xFFD1FAE5); // Mint green
                                      borderColor = const Color(0xFF10B981);
                                      textColor = const Color(0xFF065F46);
                                      break;
                                    case 'OCCUPIED':
                                      bgColor = const Color(0xFFFCE7F3); // Soft pink
                                      borderColor = const Color(0xFFF43F5E);
                                      textColor = const Color(0xFF881337);
                                      break;
                                    case 'RESERVED':
                                    default:
                                      bgColor = const Color(0xFFFEF3C7); // Warm amber
                                      borderColor = const Color(0xFFF59E0B);
                                      textColor = const Color(0xFF78350F);
                                      break;
                                  }
                                }

                                final left = (table.x / 100.0) * w;
                                final top = (table.y / 100.0) * h;
                                final tableWidth = (table.width / 100.0) * w;
                                final tableHeight = (table.height / 100.0) * h;

                                return Positioned(
                                  left: left,
                                  top: top,
                                  width: tableWidth,
                                  height: tableHeight,
                                  child: GestureDetector(
                                    onTap: () {
                                      if (isAvailable) {
                                        setState(() {
                                          selectedTableId = table.id;
                                        });
                                      } else {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text('Table ${table.tableNumber} is ${table.status.toLowerCase()}'),
                                            duration: const Duration(seconds: 1),
                                          ),
                                        );
                                      }
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      decoration: BoxDecoration(
                                        color: bgColor,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: borderColor,
                                          width: isSelected ? 2.5 : 1.2,
                                        ),
                                        boxShadow: isSelected
                                            ? [
                                                BoxShadow(
                                                  color: const Color(0xFFFACC15).withOpacity(0.6),
                                                  blurRadius: 10,
                                                  spreadRadius: 2,
                                                )
                                              ]
                                            : [
                                                BoxShadow(
                                                  color: Colors.black.withOpacity(0.2),
                                                  blurRadius: 4,
                                                  offset: const Offset(0, 2),
                                                )
                                              ],
                                      ),
                                      child: Center(
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              table.tableNumber,
                                              style: TextStyle(
                                                color: textColor,
                                                fontWeight: FontWeight.w800,
                                                fontSize: 14,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 2),
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.people_alt,
                                                  size: 11,
                                                  color: textColor.withOpacity(0.7),
                                                ),
                                                const SizedBox(width: 3),
                                                Text(
                                                  '${table.capacity}',
                                                  style: TextStyle(
                                                    color: textColor.withOpacity(0.85),
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Bottom Confirm Button
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: selectedTable != null
                        ? const Color(0xFFFACC15)
                        : const Color(0xFFE5E7EB),
                    foregroundColor: selectedTable != null ? Colors.black : Colors.grey,
                    elevation: selectedTable != null ? 3 : 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: selectedTable == null
                      ? null
                      : () {
                          context.read<CartProvider>().setTable(selectedTable.id);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Reserved ${selectedTable.tableNumber} (${selectedTable.capacity} Guests)'),
                              backgroundColor: Colors.black87,
                            ),
                          );
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const HomeScreen()),
                          );
                        },
                  child: Text(
                    selectedTable != null
                        ? 'Confirm Table (${selectedTable.tableNumber} • ${selectedTable.capacity} Guests)'
                        : 'Select an Available Table',
                    style: TextStyle(
                      color: selectedTable != null ? Colors.black : const Color(0xFF9CA3AF),
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE5E7EB)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: Color(0xFF9CA3AF),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(icon, size: 14, color: const Color(0xFF4B5563)),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  value,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF111827),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendBadge(Color color, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;

    for (double i = 0; i < size.width; i += 22) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double i = 0; i < size.height; i += 22) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
