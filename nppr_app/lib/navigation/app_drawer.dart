import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  static const items = [
    {'icon': Icons.home_outlined, 'title': 'Главная', 'route': '/'},
    {'icon': Icons.description_outlined, 'title': 'Программа', 'route': '/program'},
    {'icon': Icons.track_changes_outlined, 'title': 'Качество жизни', 'route': '/quality'},
    {'icon': Icons.how_to_vote_outlined, 'title': 'Демократия', 'route': '/democracy'},
    {'icon': Icons.account_balance_outlined, 'title': 'Экономика', 'route': '/economy'},
    {'icon': Icons.people_outline, 'title': 'Соцполитика', 'route': '/social'},
    {'icon': Icons.gavel_outlined, 'title': 'Конституция', 'route': '/constitution'},
    {'icon': Icons.info_outline, 'title': 'О партии', 'route': '/about'},
    {'icon': Icons.article_outlined, 'title': 'Новости', 'route': '/news'},
  ];

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary, Color(0xFF0D1F3C)],
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: const Text('⭐',
                        style: TextStyle(fontSize: 24)),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('НППР',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w800)),
                        SizedBox(height: 2),
                        Text('Власть Народу',
                            style: TextStyle(
                                color: Color(0xFFC8D6E5),
                                fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 12),
                itemCount: items.length,
                itemBuilder: (context, i) {
                  final item = items[i];
                  return ListTile(
                    leading: Icon(item['icon'] as IconData,
                        color: AppColors.primary),
                    title: Text(item['title'] as String,
                        style: AppTheme.body.copyWith(
                            fontWeight: FontWeight.w500)),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamedAndRemoveUntil(
                        context,
                        item['route'] as String,
                        (route) => false,
                      );
                    },
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text('© 2016–2026 НППР',
                  style: AppTheme.caption),
            ),
          ],
        ),
      ),
    );
  }
}
