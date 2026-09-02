import 'package:flutter_test/flutter_test.dart';
import 'package:yumto_core/yumto_core.dart';

void main() {
  test('MockDatabase loads Haandi by Yumto menu', () {
    final db = MockDatabase();
    expect(db.menu.isNotEmpty, true);
    expect(db.branches.isNotEmpty, true);
  });
}
