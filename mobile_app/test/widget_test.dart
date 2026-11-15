import 'package:flutter_test/flutter_test.dart';
import 'package:estrada_mobile/main.dart';

void main() {
  testWidgets('Estrada ERP Mobile smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const EstradaMobileApp());
    expect(find.text('ESTRADA ERP'), findsOneWidget);
  });
}
