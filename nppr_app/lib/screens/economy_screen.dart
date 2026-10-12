import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';
import '../widgets/info_table.dart';

class EconomyScreen extends StatelessWidget {
  const EconomyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Экономика здравого смысла')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Три сектора экономики',
            child: InfoTable(
              leftHeader: 'Сектор',
              rightHeader: 'Собственность',
              rows: const [
                MapEntry('Государственный',
                    'Народная: воздух, земля, ресурсы, энергетика, транспорт, ОПК, наука'),
                MapEntry('Коллективный',
                    'Народные предприятия: кооперативы, артели'),
                MapEntry('Индивидуальный',
                    'Частная, групповая, семейная'),
              ],
            ),
          ),
          SectionCard(
            title: 'Земля',
            child: Column(
              children: [
                _kv('Сельхозземля',
                    'Долгосрочная аренда с продлением'),
                _kv('Садовые/дачные (до 12 соток)',
                    'Пожизненно с наследованием'),
              ],
            ),
          ),
          SectionCard(
            title: 'Социальный пай',
            child: Text(
              'Наука, безопасность, пенсии, культура, образование, '
              'здравоохранение, спорт, резервы. Прозрачен для народного контроля.',
              style: AppTheme.body,
            ),
          ),
          SectionCard(
            title: 'Народный банк',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                'Финансирование развития',
                'Расчёты с населением',
                'Пенсии, сбережения',
                'Беспроцентные ссуды',
              ].map((t) => _bullet(t)).toList(),
            ),
          ),
          SectionCard(
            title: 'Историческая справка: НЭП 1921–1927',
            background: AppColors.primary,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _statWhite('Рост промышленности', '44% / год'),
                _statWhite('Доходы работающих', '×3'),
                _statWhite('Преступность', '×2 ↓'),
                _statWhite('Естественный прирост', 'выше дореволюционного'),
              ],
            ),
          ),
          SectionCard(
            title: 'Современные примеры',
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Китай', 'Тайвань', 'Индия', 'Вьетнам',
                'Узбекистан', 'Беларусь',
              ].map((c) => _chip(c)).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _kv(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(k,
                  style: AppTheme.body.copyWith(fontWeight: FontWeight.w600)),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(v, style: AppTheme.body)),
          ],
        ),
      );

  Widget _bullet(String t) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.check_circle, color: AppColors.primary, size: 18),
            const SizedBox(width: 10),
            Expanded(child: Text(t, style: AppTheme.body)),
          ],
        ),
      );

  Widget _statWhite(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(k,
                  style: AppTheme.body.copyWith(color: Colors.white)),
            ),
            Text(v,
                style: AppTheme.body.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                )),
          ],
        ),
      );

  Widget _chip(String t) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.divider),
        ),
        child: Text(t, style: AppTheme.body.copyWith(fontSize: 13)),
      );
}
