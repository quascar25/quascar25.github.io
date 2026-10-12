import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';

class NewsScreen extends StatelessWidget {
  const NewsScreen({super.key});

  static const news = [
    {
      'date': '23.09.2016',
      'title': 'Публикация программы партии',
      'desc': 'Программа НППР официально опубликована.',
    },
    {
      'date': '21.02.2016',
      'title': 'Учредительный Съезд',
      'desc': 'Принята программа партии на Учредительном Съезде.',
    },
    {
      'date': '—',
      'title': 'Форум «Россия XX–XXI»',
      'desc': 'Обсуждение Проекта народного государства в научной печати.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Новости')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: news.map((n) {
          return SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.image_outlined,
                      size: 40, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),
                Text(n['date']!, style: AppTheme.caption),
                const SizedBox(height: 4),
                Text(n['title']!, style: AppTheme.h3),
                const SizedBox(height: 6),
                Text(n['desc']!, style: AppTheme.body),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
