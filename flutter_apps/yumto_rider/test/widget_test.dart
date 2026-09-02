import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:yumto_rider/main.dart';

void main() {
  testWidgets('YumtoRiderApp mounts successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const YumtoRiderApp());
    expect(find.byType(MaterialApp), findsOneWidget);
    await tester.pump(const Duration(seconds: 4));
    await tester.pumpAndSettle();
  });
}