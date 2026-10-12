import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';
import '../widgets/info_table.dart';

class DemocracyScreen extends StatelessWidget {
  const DemocracyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Народная демократия')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Типы демократии',
            child: InfoTable(
              leftHeader: 'Тип',
              rightHeader: 'Большинство',
              rows: const [
                MapEntry('Рабовладельческая', 'Рабовладельцы'),
                MapEntry('Вольных городов', 'Состоятельные горожане'),
                MapEntry('Буржуазная', 'Владеющие капиталом'),
                MapEntry('Номенклатурная', 'Партийная номенклатура'),
                MapEntry('Народная', 'Народ'),
              ],
            ),
          ),
          SectionCard(
            title: 'Проблемы буржуазной демократии',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                'Доминирование богатых в парламенте',
                'Выборы президента — клоунада',
                'Низкий профессионализм власти',
                'Затруднён социальный лифт',
                'Нет национально-пропорциональной представительности',
                'Фальсификации на выборах',
              ].map((t) => _bullet(t)).toList(),
            ),
          ),
          SectionCard(
            title: 'Пирамида власти',
            child: Column(
              children: [
                _level('Высший Народный Совет (ВНС)', AppColors.accent),
                _arrow(),
                _level('Региональные Народные советы', AppColors.primary),
                _arrow(),
                _level('Местные Народные советы', AppColors.primary),
                _arrow(),
                _level('Корпус народных депутатов (80–100 тыс.)',
                    AppColors.primary),
                _arrow(),
                _level('Жители выдвигают 2–3 тыс. кандидатов',
                    AppColors.textSecondary),
              ],
            ),
          ),
          SectionCard(
            title: 'Ключевые элементы',
            child: InfoTable(
              rows: const [
                MapEntry('Президент',
                    'Избирается на 5 лет из 3 кандидатур ВНС'),
                MapEntry('Отзыв депутата',
                    'Ежегодный отчёт перед избирателями'),
                MapEntry('Исполнительная власть',
                    'Назначается сверху вниз'),
                MapEntry('Народный суд',
                    'Пирамида снизу вверх'),
                MapEntry('Партии',
                    'Площадки для программ, списки отменяются'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _bullet(String text) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.close, color: AppColors.accent, size: 18),
            const SizedBox(width: 10),
            Expanded(child: Text(text, style: AppTheme.body)),
          ],
        ),
      );

  Widget _level(String text, Color color) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.4)),
        ),
        child: Text(text,
            textAlign: TextAlign.center,
            style: AppTheme.body.copyWith(
                fontWeight: FontWeight.w600, color: color)),
      );

  Widget _arrow() => const Padding(
        padding: EdgeInsets.symmetric(vertical: 4),
        child: Icon(Icons.arrow_upward,
            color: AppColors.textSecondary, size: 18),
      );
}
