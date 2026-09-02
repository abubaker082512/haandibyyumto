import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:yumto_owner/main.dart';

void main() {
  testWidgets('YumtoOwnerApp mounts successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const YumtoOwnerApp());
    expect(find.byType(MaterialApp), findsOneWidget);
    await tester.pump(const Duration(seconds: 4));
    await tester.pumpAndSettle();
  });
}