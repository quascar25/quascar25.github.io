import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/content_data.dart';
import '../widgets/hero_banner.dart';
import '../navigation/app_drawer.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('НППР'),
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          HeroBanner(
            title: 'Власть\nНароду',
            subtitle: 'Государство народа как национальная идея',
            buttonText: 'Узнать больше',
            onButtonTap: () =>
                Navigator.pushNamed(context, '/program'),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Text('Разделы', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.15,
              children: QuickSectionsData.items.map((s) {
                return _QuickTile(section: s);
              }).toList(),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _QuickTile extends StatelessWidget {
  final QuickSection section;
  const _QuickTile({required this.section});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => Navigator.pushNamed(context, section.route),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(section.icon, style: const TextStyle(fontSize: 30)),
            Text(
              section.title,
              style: AppTheme.h3.copyWith(fontSize: 15),
            ),
          ],
        ),
      ),
    );
  }
}
