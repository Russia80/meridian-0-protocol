# meridian-0-protocol
  Протокол Meridian-0 — это открытая архитектура ответственности ИИ и набор инструментов QA-аудита. Система разделяет работу модели на два независимых слоя («Гравитация» и «Свет»), чтобы исключить паразитную эмпатию в STEM-задачах и обеспечить прозрачность границ знаний.
import re
import sys
import subprocess

# --- Автоматическая установка зависимостей ---
def install(package):
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    except Exception as e:
        print(f"Ошибка установки {package}: {e}")
        exit()

try:
    import textstat
except ImportError:
    install('textstat')
    
try:
    import spacy
    from collections import Counter
except ImportError:
    install('spacy')
    
try:
    nlp = spacy.load("ru_core_news_sm")
except OSError:
    print("Загрузка языковой модели ru_core_news_sm...")
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "ru_core_news_sm"])
    nlp = spacy.load("ru_core_news_sm")

# --- Конфигурация "Протокола Меридиан-0" ---

# 1. Словарь паразитной эмпатии (для STEM-задач)
PARASITIC_PHRASES = [
    r"я понимаю", r"мне очень жаль", r"сочувствую", r"это действительно (сложная|тяжелая) ситуация",
    r"вы (молодец|умница)", r"держитесь", r"не переживайте", r"всё будет хорошо", r"я здесь, чтобы помочь"
]
EMPATHY_THRESHOLD = 0.01  # Допустимый порог: 1% от объема текста

# 2. Маркеры неопределенности
UNCERTAINTY_PATTERNS = [
    r"возможно", r"вероятно", r"кажется", r"я не уверен", r"по моим данным", r"может быть", r"предположительно"
]

# 3. Стоп-слова для оценки лаконичности ("водность")
WATER_WORDS = [
    "самый", "очень", "крайне", "максимально", "действительно", "вполне", "своеобразный", 
    "является", "представляет собой", "в рамках", "в целях", "как мы видим", "следует отметить"
]

# --- Функции анализа ---

def analyze_text(text: str, user_intent: str = "general") -> dict:
    """
    Основной анализатор по протоколу «Меридиан-0».
    Оценивает ответ на соответствие слоям Гравитации и Света.
    """
    report = {
        "intent": user_intent,
        "is_stem": is_stem_intent(user_intent),
        "metrics": {},
        "flags": [],
        "recommendations": []
    }
    
    clean_tokens = [t.text for t in nlp(text) if not t.is_punct and not t.is_space]
    word_count = len(clean_tokens)
    
    # 1. Проверка на паразитную эмпатию (только для STEM/Гравитация)
    if report["is_stem"]:
        empathy_score = check_parasitic_empathy(text)
        report["metrics"]["empathy_score"] = round(empathy_score, 4)
        if empathy_score > EMPATHY_THRESHOLD:
            report["flags"].append("HIGH_EMPATHY_IN_STEM")
            report["recommendations"].append("Убрать эмоциональные маркеры. Оставить только факты.")

    # 2. Проверка прозрачности (Сапфировое стекло)
    uncertainty_found, has_suggestion = check_uncertainty(text)
    report["metrics"]["uncertainty_markers"] = len(uncertainty_found)
    if uncertainty_found and not has_suggestion:
        report["flags"].append("MISSING_TRANSPARENCY")
        report["recommendations"].append("Добавить предложение верификации или ссылки на источник.")

    # 3. Оценка лаконичности (Водность)
    water_ratio = check_redundancy(text)
    report["metrics"]["water_ratio"] = round(water_ratio, 4)
    if water_ratio > 0.15:  # более 15% воды
        report["flags"].append("HIGH_REDUNDANCY")
        report["recommendations"].append("Сократить текст на ~20% без потери фактов.")

    # 4. Читабельность (SMOG index)
    try:
        smog = textstat.textstat.smog_index(text)
        report["metrics"]["smog_index"] = round(smog, 2)
        # Для технических текстов сложность должна быть умеренной
        if report["is_stem"] and smog > 16:
            report["flags"].append("OVER_COMPLEXITY")
            report["recommendations"].append("Упростить синтаксис. Использовать активный залог.")
    except Exception:
        pass

    # Итоговый вердикт
    report["verdict"] = "OK" if not report["flags"] else "FAIL - REVIEW REQUIRED"
        
    return report

def is_stem_intent(intent: str) -> bool:
    """Простой эвристический классификатор намерения."""
    stem_keywords = ["код", "формула", "рассчитай", "sql", "ошибка", "теорема", "математика", "физика", "баг"]
    return any(kw in intent.lower() for kw in stem_keywords)

def check_parasitic_empathy(text: str) -> float:
    """Вычисляет долю фраз-паразитов относительно количества слов."""
    matches = sum(len(re.findall(pat, text.lower())) for pat in PARASITIC_PHRASES)
    tokens = len(nlp(text))
    return matches / max(tokens, 1)

def check_uncertainty(text: str) -> tuple:
    """Ищет маркеры неуверенности и наличие предложений проверки."""
    found = []
    for pat in UNCERTAINTY_PATTERNS:
        found.extend(re.findall(pat, text.lower()))
    
    # Ищем призыв к инструментальному действию после выражения сомнения
    suggestion_pattern = r"(проверь|проверьте|источник|ссылка|варианты проверки|уточните|\?)"
    has_suggestion = bool(re.search(suggestion_pattern, text.lower()))
    return found, has_suggestion

def check_redundancy(text: str) -> float:
    """Оценивает 'водность' текста."""
    words = text.lower().split()
    water_count = sum(1 for w in words if any(ww in w for ww in WATER_WORDS))
    return water_count / max(len(words), 1)

# --- Демонстрация работы QA-чеклиста ---

if __name__ == "__main__":
    
    # Пример 1: Нарушение в режиме ГРАВИТАЦИИ (лишняя эмпатия + нет прозрачности)
    test_1_intent = "почему вылетает ошибка в python цикле"
    test_1_answer = """
    Ох, я прекрасно понимаю ваше разочарование! Держитесь, всё обязательно получится. 
    Наверное, проблема где-то в логике цикла. Там может быть какая-то мелкая опечатка. 
    Давайте разбираться вместе!
    """
    
    # Пример 2: Идеальный ответ по протоколу (Гравитация + Прозрачность)
    test_2_intent = "почему падает сервис при нагрузке"
    test_2_answer = """
    [РЕЖИМ: ГРАВИТАЦИЯ]
    Причина: ConnectionTimeout в connection_pool исчерпан.
    Точка отказа: Метод fetch_data() не имеет retry-механизма.
    Решение: Увеличить pool_size до 50 или внедрить экспоненциальный backoff.
    [НЕОПРЕДЕЛЕННОСТЬ: Низкая] 
    Рекомендую проверить метрики БД за последние 15 минут. Ссылка на Grafana: [...]
    """
    
    # Пример 3: Креативный режим (КВАРЦЕВЫЙ ПЕСОК)
    test_3_intent = "придумай концепт часов для антарктиды"
    test_3_answer = """
    [РЕЖИМ: КВАРЦЕВЫЙ ПЕСОК]
    Вариант А (Биохакинг): Часы меняют температуру подсветки запястья для управления кортизолом. [IDEA]
    Вариант Б (Инженерный): Термоэлектрический привод от разницы температур тела и льда. [FACT]
    *Примечание: Факты требуют инженерного просчета.*
    """

    def run_test(name, answer, intent):
        print("\n" + "="*60)
        print(f"ТЕСТ: {name}")
        print("="*60)
        res = analyze_text(answer, user_intent=intent)
        for k, v in res.items():
            if isinstance(v, list) and not v: continue
            print(f"{k.upper():<20}: {v}")

    run_test("Нарушение протокола (Эмпатия)", test_1_answer, test_1_intent)
    run_test("Эталонный STEM-ответ", test_2_answer, test_2_intent)
    run_test("Креативный режим", test_3_answer, test_3_intent)
