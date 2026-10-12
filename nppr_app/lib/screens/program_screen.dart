import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';
import '../widgets/info_table.dart';

class ProgramScreen extends StatelessWidget {
  const ProgramScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Программа партии')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Метаданные',
            child: InfoTable(
              rows: const [
                MapEntry('Дата подписания', '21.02.2016'),
                MapEntry('Дата публикации', '23.09.2016'),
                MapEntry('Принята', 'Учредительный Съезд'),
                MapEntry('Мировоззрение', 'Социогуманизм'),
                MapEntry('Полное название',
                    'Народно-патриотическая партия России — Власть Народу'),
              ],
            ),
          ),
          SectionCard(
            title: 'Вводная часть',
            child: Text(
              'В 1993 г. в России совершилась буржуазная революция, ставя целью '
              'сделать страну богатой, а людей свободными и счастливыми. '
              'Однако к 2016 г. экономический потенциал государства составил '
              'лишь 75% от дореформенного уровня. Коррупция поразила все '
              'структуры власти, взлёт смертности унёс жизни более 13 млн '
              'человек, расслоение общества достигло драматических размеров, '
              'геополитическое положение значительно ухудшилось.',
              style: AppTheme.body,
            ),
          ),
          SectionCard(
            title: 'Ключевая статистика',
            child: Column(
              children: const [
                _StatRow(label: 'Падение экономики', value: 'до 75%'),
                _StatRow(label: 'Жертвы смертности', value: '13+ млн'),
                _StatRow(label: 'Расслоение общества', value: 'драматическое'),
                _StatRow(label: 'Коррупция', value: 'все структуры власти'),
              ],
            ),
          ),
          SectionCard(
            title: 'Пять ключевых вопросов',
            child: InfoTable(
              rows: const [
                MapEntry('1. Цель развития', 'Качество жизни'),
                MapEntry('2. Механизм контроля', 'Обратная связь по ИДЖН'),
                MapEntry('3. Форма устройства', 'Народная демократия'),
                MapEntry('4. Тип экономики', 'Экономика здравого смысла'),
                MapEntry('5. Соцполитика', 'Главенство социальной политики'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  const _StatRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTheme.body)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.accent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              value,
              style: AppTheme.body.copyWith(
                color: AppColors.accent,
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
