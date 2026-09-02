import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class LiveTrackingMapWidget extends StatefulWidget {
  final String orderId;
  final String riderName;
  final String riderPhone;
  final String destinationSector;
  final String destinationAddress;
  final double height;

  const LiveTrackingMapWidget({
    super.key,
    this.orderId = 'ORD-ISB-2026',
    this.riderName = 'Zahid Rider (Islamabad)',
    this.riderPhone = '0345-6789012',
    this.destinationSector = 'Block B, Gulberg Greens',
    this.destinationAddress = 'House 14, Street 7, Block B, Gulberg Greens, Islamabad',
    this.height = 360,
  });

  @override
  State<LiveTrackingMapWidget> createState() => _LiveTrackingMapWidgetState();
}

class _LiveTrackingMapWidgetState extends State<LiveTrackingMapWidget> {
  // Restaurant: Civic Center, Executive Block, Gulberg Greens, Islamabad
  static const LatLng restaurantCoords = LatLng(33.5932, 73.1365);
  // Destination: Block B, Gulberg Greens
  static const LatLng destinationCoords = LatLng(33.6078, 73.1352);

  late final List<LatLng> routePoints;
  late final MapController _mapController;
  Timer? _simulationTimer;
  double _progress = 0.35;
  bool _isPlaying = true;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();

    // Road points simulating the Gulberg Greens main boulevard
    routePoints = [
      restaurantCoords,
      const LatLng(33.5965, 73.1385),
      const LatLng(33.6010, 73.1370),
      const LatLng(33.6045, 73.1360),
      destinationCoords,
    ];

    _startSimulation();
  }

  void _startSimulation() {
    _simulationTimer?.cancel();
    _simulationTimer = Timer.periodic(const Duration(milliseconds: 1400), (timer) {
      if (!mounted || !_isPlaying) return;
      setState(() {
        if (_progress >= 1.0) {
          _progress = 1.0;
        } else {
          _progress += 0.03;
        }
      });
    });
  }

  LatLng _calculateRiderPosition() {
    if (routePoints.length < 2) return routePoints.first;
    final clamped = _progress.clamp(0.0, 1.0);
    final totalSegments = routePoints.length - 1;
    final targetIndex = clamped * totalSegments;
    final segIndex = targetIndex.floor().clamp(0, totalSegments - 1);
    final segProgress = targetIndex - segIndex;

    final p1 = routePoints[segIndex];
    final p2 = routePoints[segIndex + 1];

    return LatLng(
      p1.latitude + (p2.latitude - p1.latitude) * segProgress,
      p1.longitude + (p2.longitude - p1.longitude) * segProgress,
    );
  }

  @override
  void dispose() {
    _simulationTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext buildContext) {
    final riderPos = _calculateRiderPosition();
    final isDelivered = _progress >= 1.0;
    final remainingKm = (1.4 * (1 - _progress)).clamp(0.0, 1.4);
    final etaMinutes = (remainingKm * 3.5).ceil() + 2;

    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFEADBCC), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1A120B), Color(0xFF2A1F17)],
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: isDelivered ? const Color(0xFF15803D) : const Color(0xFFE85D04),
                  child: Icon(
                    isDelivered ? Icons.check_circle : Icons.two_wheeler,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Text(
                            isDelivered ? 'Order Arrived' : 'Rider on the Way',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE85D04),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('OSM LIVE', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      Text(
                        '${widget.riderName} · ${widget.riderPhone}',
                        style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 10),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('ETA', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 8, fontWeight: FontWeight.bold)),
                      Text(
                        isDelivered ? 'Delivered' : '$etaMinutes min',
                        style: const TextStyle(color: Color(0xFFF4C430), fontSize: 12, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // OpenStreetMap View
          Expanded(
            child: FlutterMap(
              mapController: _mapController,
              options: const MapOptions(
                initialCenter: LatLng(33.6005, 73.1360),
                initialZoom: 14.5,
              ),
              children: [
                // 100% Free OpenStreetMap Tile Layer
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.yumto.haandi',
                ),

                // Road Polyline
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: routePoints,
                      color: const Color(0xFFE85D04),
                      strokeWidth: 4.5,
                    ),
                  ],
                ),

                // Markers (Restaurant, Destination, Moving Rider)
                MarkerLayer(
                  markers: [
                    // Restaurant Marker
                    const Marker(
                      point: restaurantCoords,
                      width: 36,
                      height: 36,
                      child: CircleAvatar(
                        backgroundColor: Color(0xFF8B1E1E),
                        child: Text('🍲', style: TextStyle(fontSize: 16)),
                      ),
                    ),

                    // Customer House Marker
                    const Marker(
                      point: destinationCoords,
                      width: 36,
                      height: 36,
                      child: CircleAvatar(
                        backgroundColor: Color(0xFF15803D),
                        child: Text('🏠', style: TextStyle(fontSize: 16)),
                      ),
                    ),

                    // Moving Rider Marker
                    Marker(
                      point: riderPos,
                      width: 44,
                      height: 44,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFE85D04),
                          border: Border.all(color: Colors.white, width: 2.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.orange.withOpacity(0.5),
                              blurRadius: 10,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Text('🛵', style: TextStyle(fontSize: 20)),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Controls & Destination Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            color: const Color(0xFFFBF8F3),
            child: Row(
              children: [
                const Icon(Icons.location_on, color: Color(0xFF8B1E1E), size: 16),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    widget.destinationSector,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1A120B)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                InkWell(
                  onTap: () => setState(() => _isPlaying = !_isPlaying),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: const Color(0xFFEADBCC)),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_isPlaying ? Icons.pause : Icons.play_arrow, size: 12, color: const Color(0xFF1A120B)),
                        const SizedBox(width: 3),
                        Text(_isPlaying ? 'Pause' : 'Play', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                InkWell(
                  onTap: () => setState(() => _progress = 0.1),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: const Color(0xFFEADBCC)),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(Icons.refresh, size: 14, color: Color(0xFF6B5B4C)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
