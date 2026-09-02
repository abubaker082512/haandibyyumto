import 'package:flutter/material.dart';
import '../mock_db.dart';
import '../models.dart';

class RiderScreen extends StatelessWidget {
  const RiderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF18181B),
      appBar: AppBar(
        title: const Text('Rider Active Deliveries'),
        backgroundColor: const Color(0xFF27272A),
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Color(0xFFFACC15)),
            onPressed: () {},
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildDeliveryCard(
            context,
            orderId: 'ORD-5829',
            customerName: 'Ahsan',
            address: 'DHA Phase 6, Sector L',
            timeElapsed: '12m ago',
            status: 'OUT_FOR_DELIVERY',
          ),
          const SizedBox(height: 16),
          _buildDeliveryCard(
            context,
            orderId: 'ORD-5830',
            customerName: 'Fatima',
            address: 'Gulberg 2, Main Blvd',
            timeElapsed: '2m ago',
            status: 'READY_FOR_PICKUP',
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryCard(BuildContext context, {required String orderId, required String customerName, required String address, required String timeElapsed, required String status}) {
    bool isReady = status == 'READY_FOR_PICKUP';
    return Card(
      color: const Color(0xFF27272A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(orderId, style: const TextStyle(color: Color(0xFFFACC15), fontWeight: FontWeight.bold, fontSize: 18)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isReady ? Colors.green.withOpacity(0.2) : Colors.blue.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    isReady ? 'READY TO PICK' : 'DELIVERING',
                    style: TextStyle(color: isReady ? Colors.greenAccent : Colors.blueAccent, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                )
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.person, color: Colors.white54, size: 20),
                const SizedBox(width: 8),
                Text(customerName, style: const TextStyle(color: Colors.white, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on, color: Colors.white54, size: 20),
                const SizedBox(width: 8),
                Expanded(child: Text(address, style: const TextStyle(color: Colors.white70, fontSize: 14))),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isReady ? const Color(0xFFFACC15) : Colors.blueAccent,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: () {},
                child: Text(isReady ? 'Confirm Pickup' : 'Mark Delivered', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
