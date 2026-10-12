import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';
import '../widgets/quote_block.dart';

class ConstitutionScreen extends StatelessWidget {
  const ConstitutionScreen({super.key});

  static const violations = [
    MapEntry('ст. 3, пп. 2,3', 'Нет референдума в нужное время'),
    MapEntry('ст. 32, п. 2', 'Нет реального права быть избранным'),
    MapEntry('ст. 19, п. 1,2', 'Нет равенства перед законом'),
    MapEntry('ст. 7, п. 1', 'Нет условий достойной жизни'),
    MapEntry('ст. 8, п. 2', 'Нарушена неприкосновенность госсобственности'),
    MapEntry('ст. 41, п. 1', 'Медпомощь платная'),
    MapEntry('ст. 43, п. 2', 'Нет бесплатного дошкольного и общего образования'),
    MapEntry('ст. 14', 'Финансирование религиозных организаций из бюджета'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Защита Конституции')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const QuoteBlock(
            text: 'Носителем суверенитета и единственным источником власти '
                'в РФ является её многонациональный народ',
            author: 'Конституция РФ, ст. 3',
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: 'Социогуманизм',
            child: Text(
              'Новая общественно-экономическая формация, идущая на смену '
              'капитализму и коммунизму. Легитимность определяется Основами '
              'конституционного строя РФ.',
              style: AppTheme.body,
            ),
          ),
          SectionCard(
            title: 'Противоречия либерального строя',
            child: Column(
              children: violations.map((e) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 10),
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: AppColors.accent.withOpacity(0.2)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          e.key,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(e.value, style: AppTheme.body),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          SectionCard(
            title: 'Призыв',
            background: AppColors.primary,
            child: Text(
              'Общественная сила, объединяющая лучших представителей народа, '
              'вооружённых передовой научной идеологией — '
              '«НППР — Власть Народу».',
              style: AppTheme.body.copyWith(color: Colors.white, height: 1.6),
            ),
          ),
        ],
      ),
    );
  }
}
