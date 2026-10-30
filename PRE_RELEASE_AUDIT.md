# Предрелизный аудит: исходная точка

## PERF-01: локальная реализация, browser-замер ещё требуется

Пользователь разрешил начать с раннего Turnstile Home. Проверка browser skill/runtime
вернула пустой список браузеров; troubleshooting не предоставил доступного подключения.
Новый Network/Performance baseline и готовность widget агентом не измерялись.
Повторный разбор исторического localhost.har (2026-10-28) подтвердил 3 запроса
challenges.cloudflare.com и 225734 B transfer, включая redirect, script и challenge iframe.
HAR использует тестовый site key; это не измерение стоимости текущего production widget.

До изменения сохранена отдельная production-сборка и metadata во временном каталоге
confident-turnstile-before-591jydbb. Main JS: 523395 B; gzip Python default: 157058 B
(параметры отличаются от Vite gzip-report, сравнивать следует только одинаковые параметры).
Изменение: ContactDrawer монтирует ContactForm только при isOpen; закрытие unmount-ит widget,
а повторное открытие сохраняет существующую модель fresh session через drawerSession key.
TurnstileWidget уже удаляет widget и игнорирует завершение promise после unmount.
References Home modal уже условно монтирует widget; dedicated Contact/References не менялись.
Основной JS не разбивается: эффект направлен на отложенную работу и сторонние запросы,
а не на уменьшение bundle. FCP/LCP выигрыш не заявляется.
После: main JS 523398 B / Python gzip 157061 B, delta +3 B в обоих измерениях.
Это ожидаемо практически неизменный bundle; TypeScript, lint, 205 тестов и build прошли.
Требуется свежий HAR Home, открытие/закрытие/повторное открытие формы и ожидание security check
на обычной/ограниченной сети без отправки сообщения. Изменение локальное, не опубликовано.
Пользователь подтвердил в браузере: запросы появляются только после открытия Contact,
затем сообщил, что всё работает, и разрешил commit. Дополнительный HAR не запрашивается
для уже подтверждённого переноса запросов; готовность на ограниченной сети, expiry/error
и влияние на FCP/LCP не считаются измеренными. Реальная отправка в рамках фикса не выполнялась.

## Пользовательский production-проход: текущий итог

- Пользователь подтвердил все изменения на production и завершение проверки 200%.
- После инструкции проверить reduced motion сообщил, что всё работает.
- Сообщил о просмотре сайта в Safari и Chrome; версии, отдельная матрица устройств
  и полный набор сценариев каждого браузера не зафиксированы. Firefox и реальные мобильные
  устройства не считаются проверенными без отдельного подтверждения.
- После инструкции проверить Offline, возврат сети и Retry сообщил, что восстановление работает.
  Конкретные проверенные маршруты не перечислялись; это не полное fault-injection покрытие.
- Попросил прекратить проверку/изменение палитры. Подтверждённые недостаточные значения
  контраста ниже остаются известными ограничениями; контраст не отмечается пройденным.

## Контраст Home Hero: подтверждённая проблема подписи

Дополнительный пользовательский замер: подпись NAME на странице Contact Me — 2.72:1.
Это обычный мелкий текст и также не проходит 4.5:1. Проблема подтверждена для двух
отдельных поверхностей (Hero subtitle и Contact label); остальные элементы автоматически
не считаются проверенными. Цвета формы не менялись.

Пользователь измерил в production DevTools контраст 1.4:1 для подписи
Product-Focused Software Developer. В HeroSection.module.css это обычный текст
font-weight:400, font-size:clamp(1rem,1.45vw,1.375rem), с color-text-muted.
Требуется 4.5:1 по WCAG 2.2 SC 1.4.3; это подтверждённое несоответствие по сообщённому измерению.
Для белых I BUILD STUFF и VADIM ISKAKOV пользователь сообщил 3.17:1:
крупный Hero h1 проходит порог 3:1; мелкая identity требует отдельной оценки как бренд/логотип,
а для обычного мелкого текста такой контраст был бы недостаточен.
Осветление одной подписи до белого не даст 4.5:1 на том же фоне с измеренными 3.17:1.
Цвета не менялись: сначала согласовать решение, сохраняющее утверждённую композицию.
Источник порогов: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

## Contact: document scrolling в narrow/short viewport

По запросу пользователя Contact использует тот же диапазон <=48rem × <=32rem:
page/content/panel растут по содержимому, внутренний panel scroll заменён document scrolling,
heading/spacing/frame сохраняются. Contact владеет conditional shared root lock;
последняя безусловная route-блокировка удалена из AppLayout, поскольку все dedicated routes
теперь сами выбирают режим. Независимые menu/dialog locks сохраняются.
ContactForm получает явный document-flow режим только со страницы: auto rows, заданные
читаемые input/message/action размеры, рост для ошибок и Turnstile feedback.
Home drawer и API lifecycle не менялись. Требуется проверить при 200% все поля, Scope/Budget,
Send, ошибки пустой формы, вертикальную прокрутку над панелью, затем 100%/mobile и Home drawer.
После предоставления preview и инструкции проверки пользователь разрешил commit.
Подробные результаты отдельных browser-сценариев не сообщались.
TypeScript, lint, 205 тестов и production build прошли.
Реальная отправка не выполнялась. Изменение ещё не опубликовано.

## References: document scrolling в narrow/short viewport

По запросу пользователя применено общее условие <=48rem × <=32rem:
References сам управляет shared root lock и освобождает его в этом диапазоне.
Frame/track растут по содержимому, guestbook и inline form остаются двумя горизонтальными
слайдами, heading/spacing сохраняются. Внутренний вертикальный скролл feed/form снят;
textarea по-прежнему прокручивает длинный текст внутри своего поля.
Форма получает document-flow layout с content-driven rows, input height 2.75rem,
местом для testimonial/Send и растущими feedback/errors. Size containment снят только
для вертикального измерения в этом режиме, чтобы форма не схлопывалась.
ReferenceList наблюдает sentinel относительно document viewport, а не растущего feed root,
чтобы не загружать все страницы отзывов сразу. Default поведение Home/других размеров не менялось.
Требуется проверить обе slide-позиции, поля/ratings/testimonial, feedback, pagination,
возврат к обычному viewport и независимый lock удаления. Реальные отзывы не отправлялись.
После инструкции проверить оба слайда при 200%, доступность полей/Send и сравнить
с обычным размером пользователь подтвердил результат и разрешил commit.
TypeScript, lint, 205 тестов и production build прошли. Pagination с несколькими страницами,
модальное удаление и отдельные устройства в рамках этого фикса не подтверждались.
Изменения ещё не опубликованы.

## About: document scrolling вместо внутреннего Profile scroll

Пользовательский image.png показывает внутреннюю полосу прокрутки Profile при увеличении;
пользователь запросил сохранение дизайна с прокруткой страницы вместо блока.
В том же диапазоне <=48rem × <=32rem About освобождает свой shared root lock,
а frame/track получают высоту по содержимому. Горизонтальные Profile и Details остаются
двумя слайдами; общая высота определяется более высоким содержимым, внутренние scroll regions
в этом режиме убраны. Заголовок, отступы, данные и остальные viewport-режимы не менялись.
После инструкции проверить обе slide-позиции, полный Profile/post/actions, Details/Links
и сравнить с 100%/обычным mobile пользователь подтвердил результат и разрешил commit.
TypeScript, lint, 205 тестов и production build прошли. Изменение ещё не опубликовано.

## Services index: narrow/short viewport

Пользователь подтвердил Projects и сообщил, что при тех же условиях Services не помещаются.
Используется то же условие <=48rem по ширине и <=32rem по высоте, выделенное в общий
useShortMobileViewport без изменения поведения Projects.
Services index и открытая услуга в этом диапазоне получают height:auto и document scrolling;
title/spacing/row geometry и обычные desktop/mobile размеры не менялись.
Services сам владеет conditional shared root lock. Для деталей content получает явную высоту
из baseHeight showcase, текущей высоты service header, gap, padding и border;
вне диапазона детали остаются viewport-locked.
Opening/closing в этом диапазоне выполняются прямой навигацией и reset document top,
чтобы не строить expansion/collapse из scrolled index; прочие режимы сохраняют анимацию
и текущую непрозрачную подложку. Modified links остаются native.
Требуется проверка полного списка при 200%, открытия нижней услуги, Back/Forward,
100%, обычного мобильного окна и mobile menu. Пользователь подтвердил список; затем image.png
показал clipping открытой услуги и отсутствие page scrolling. Fallback распространён на детали;
После инструкции проверить открытый Product & UI/UX Design при 200%, обе прокрутки
и доступность Tools/Used In пользователь подтвердил результат и разрешил commit.
TypeScript, lint, все 205 тестов и production build прошли.
Отдельные проверки всех услуг/устройств не заявляются. Изменения ещё не опубликованы.

## Projects: fallback для narrow/short viewport

Предыдущие незакоммиченные попытки исправления Projects полностью отменены по просьбе пользователя.
Согласован новый ограниченный вариант по available viewport, без определения устройства/zoom:
пользователь измерил 480×430 CSS px при 200%. Условие охватывает диапазон <=48rem по ширине
и <=32rem по высоте, включая низкие окна/landscape; обычные высокие мобильные окна не меняются.
Только в этом диапазоне Projects освобождает свой shared root lock, страница растёт вниз,
а browser получает явную высоту из общих panel tokens плюс запас на существующий chrome.
Title, top spacing, browser anchor, horizontal rail и сама формула panel scale не изменялись.
Vertical scrolling внутри rail не добавляется. В fallback над rail разрешены vertical page gestures.
Projects теперь сам владеет conditional root lock, независимо от остальных route/menu/dialog locks.
После инструкции сравнить 200%, 100% и обычный мобильный viewport пользователь подтвердил
результат и разрешил commit. Отдельные проверки всех соседних размеров/устройств не заявляются.
Пока локальная версия; в production не отправлялась.

## Home: завершён текущий пользовательский проход

Пользователь сообщил о завершении Tab-проверки, затем проверил Home при увеличении,
подтвердил исправление прокрутки Projects и разрешил commit/push после изменения Services.
Текущий проход Home закрыт по пользовательской проверке; это не подтверждение всех
браузеров, реальных устройств, контраста, screen reader или reduced-motion сценариев.
TypeScript, ESLint, production build и все 205 автоматических тестов прошли.

## Home Services: content-driven height при zoom

На пользовательском image.png при увеличении видны три строки с обрезанной третьей;
четвёртая не помещается. У секции были height:100svh, overflow:hidden и grid minmax(0,1fr).
По согласованию с пользователем секция теперь имеет min-height:100svh и растёт по контенту,
сдвигая Profile в normal flow без внутреннего вертикального скролла.
Строки сохраняют минимальную исходную высоту. Mobile раскрытие использует grid 0fr/1fr
вместо фиксированной высоты открытой строки и max-height описания; исходная минимальная
геометрия раскрытия сохранена, более длинное описание увеличивает строку.
Services-to-Profile пересчитывается ResizeObserver при изменении высоты Services.
После проверки пользователь сообщил, что Home закрыта, и разрешил публикацию.
Отдельные reduced-motion/device проверки и production smoke после деплоя остаются.

## Home Projects: clipping при 200% zoom

Пользовательский image.png подтвердил обрезку breakdown и нижнего контента обратной стороны
SuperSauced при увеличении; пользователь подтвердил невозможность прокрутки.
Карточка ограничена высотой секции, а .face имеет overflow:hidden.
Добавлена внутренняя native вертикальная scroll-область для полного содержимого back face,
с keyboard-focus только для открытого оборота и доступным именем региона.
Кнопка переворота остаётся вне scroll-области; предусмотренный нижний inset сохранён.
Размеры секции, карточек и scroll-переходы не менялись. Пользователь подтвердил результат
в preview; отдельные проверки реальных touch-устройств остаются.

## Projects tab focus boundary

Пользователь подтвердил keyboard-переходы Projects, но заметил обводку вкладки поверх browser frame.
Вкладки имеют намеренное перекрытие 1.5rem, а :focus-visible поднимал полный tab до z-index:3.
Удалён этот подъём; focus ring ограничен видимой высотой --browser-tabs-layout-height
и размещён внутри вкладки, чтобы не обрезаться в мобильном горизонтальном scroll-контейнере.
Изменение локальное; визуальная перепроверка пользователем ещё требуется.

## Production forms и Home keyboard focus: пользовательская проверка

Пользователь настроил Resend и подтвердил получение письма после отправки Contact на основном домене.
Для References подтверждены отправка пользователем, появление в административном API,
восстановление заявки после reload, Withdraw и операции модерации/удаления по инструкции Postman.
Это пользовательские проверки реальных форм; агент отправки и модерацию не выполнял.
Предыдущие записи о непроверенных submissions ниже описывают более ранние этапы.

A11Y-01: после Scroll to explore переход Tab визуально показывал Services вместо Projects.
Лог focusin пользователя подтвердил `home-projects / Show details for SuperSauced`:
порядок фокуса сохранён, проблема касается видимости сфокусированной карточки при scroll-motion.
Добавлено мгновенное выравнивание секции Projects при входе keyboard-visible фокуса извне;
обычные Tab внутри секции и pointer/scroll взаимодействия не меняются.
Пользователь подтвердил исправление в local production preview после инструкции проверить Tab/Shift+Tab.
Отдельные проверки mobile rail, reduced motion и опубликованной версии ещё требуются.

## Custom domain: DNS/TLS и API проверены

Владелец купил confidentdeveloper.space через Cloudflare и сообщил Render Verified после настройки DNS.
GET smoke test с проверкой TLS подтвердил:

- HTTP apex → 301 → HTTPS apex → HTML 200.
- HTTPS www → 301 → HTTPS apex → HTML 200.
- HTTPS apex `/projects/unicon` → HTML 200, SPA fallback работает на HTTP-уровне.
- `/api/health` → JSON 200 success=true/database=connected.
- `/api/v1/projects` → JSON 200 с тремя проектами, unknown project → JSON 404.
- GET Profile interaction revision=1 с Origin основного домена → 200,
  ACAO=https://confidentdeveloper.space, Cache-Control private,no-store.
  Set-Cookie в этом ответе нет, поэтому выдачу/сохранение visitor cookie этой проверкой не подтверждаем.
- До этого финальные проверки allowlist подтвердили основной origin 200 и чужой 403.

Доменная маршрутизация и сертификат проверены; это не завершение проверки форм и браузерного rendering.
Остаются production Turnstile на основном hostname, proxy/client-IP, controlled submissions/mail,
незавершённые accessibility/device проверки и измерения/фиксы из реестра.
Агент выполнял только GET; реальные сообщения, отзывы, лайки и view POST не отправлял.

## Production Turnstile: пользовательская проверка UI

После настройки production widget, frontend VITE_TURNSTILE_SITE_KEY и backend TURNSTILE_SECRET_KEY
по инструкции пользователь сообщил, что сообщение о ненастроенной отправке исчезло и всё работает.
Это подтверждает пользовательский UI-результат на временном frontend адресе;
secret/token значения не запрашивались и агентом не читались.
Siteverify успех, expiry/error lifecycle и end-to-end Contact/References submission ещё не подтверждены.
Реальные отправки не согласованы и не выполнялись агентом.
Следующий шаг — DNS provider и подключение confidentdeveloper.space с TLS,
затем проверка cookies/proxy и отдельно согласованная проверка доставки.

## Render Origin allowlist после изменения окружения

Пользователь добавил временный frontend origin и запустил обновление backend.
Первые GET ещё видели 403; спустя около 23 s повторные проверки direct backend и frontend rewrite
для /api/health и /api/v1/projects вернули 200 с ACAO=https://confidentdeveloper.onrender.com.
Проверку во время redeploy не принимаем за устойчивое конечное состояние.
Основной origin и отрицательный контроль проверяются отдельно; CORS GET-проверка не заменяет
серверную проверку Turnstile, protected POST, cookies или client-IP/rate-limit конфигурацию.
Реальные submissions не отправлялись. ENV-01 локального preview не закрывается автоматически
разрешением production Render URL.

## Render frontend: опубликованный GET smoke test

Frontend https://confidentdeveloper.onrender.com создан пользователем.
Проверки через curl с включённой TLS validation:

- `/`, `/projects/unicon`, `/services/product-ui-ux`, `/about`, `/references`, `/contact`, `/audit-unknown`
  возвращают HTML 200 (490 B): SPA fallback работает на HTTP-уровне; это не полная проверка DOM/render.
- `/api/health` возвращает JSON success/database=connected через frontend origin.
- Public projects (3), Home services (4), GitHub summary, Profile Post и References возвращают JSON 200.
- Неизвестный `/api/v1/projects/audit-unknown` возвращает JSON 404, а не SPA HTML.
- JS/CSS/WOFF2/PNG и WASM отвечают 200 с соответствующими MIME.
- JS, CSS и Rive WASM отдаются с Content-Encoding:gzip. PERF-06: риск отсутствия HTTP-сжатия
  в local preview не воспроизвёлся на Render; ручная precompression сейчас не обоснована.
- Статика имеет Cache-Control public,max-age=0,s-maxage=300; длительный browser immutable cache
  для fingerprinted assets пока не настроен. Public API сохраняет свои cache headers.
- GET `/api/v1/projects` с Origin=https://confidentdeveloper.onrender.com возвращает 403;
  с Origin=https://confidentdeveloper.space возвращает 200 с правильным ACAO/credentials.
  Для текущего временного адреса нужна правка CLIENT_ORIGINS; POST не отправлялся.
- Python urllib локально не нашёл доверенный CA; повтор через системный curl проверяет TLS успешно.
  Это локальная настройка Python, не доказательство проблемы сертификата сайта.

Следующий шаг: backend CLIENT_ORIGINS=https://confidentdeveloper.space,https://confidentdeveloper.onrender.com,
Save and deploy, повторить GET с Origin. Затем production Turnstile/public site key и настройка домена.
Cookies, protected mutations, proxy client IP и успешные submissions всё ещё не проверены.

## Render backend: первый запуск

Пользователь создал Free backend https://confidentdeveloper-api.onrender.com.
Первый старт завершался querySrv EBADNAME для буквального `<cluster>` — в MONGODB_URI
оставалась заглушка примера. После замены пользователь сообщил успешный запуск.
Независимые публичные GET подтвердили /api/health success=true/database=connected
и /api/v1/projects success=true, slugs unicon/supersauced/domsot.
Это подтверждает запуск и чтение контента; Origin/cookies/Turnstile/mail и IP proxy поведение
в production frontend topology ещё не проверены. POST/настройки удалённого сервиса агентом не выполнялись.

## Подготовка CI/CD и переход к размещению

Пользователь предложил сразу production-размещение с дальнейшими исправлениями и автоматическим
обновлением после коммитов. Подготовлены CI workflows frontend/backend на push/PR к main,
без production-секретов; проверки выполняются до Render auto-deploy (After CI Checks Pass).
Локальный commit не публикует сайт: нужен push связанной ветки. Ветка задания и её сервис сохраняются.
Frontend deployment runbook — DEPLOYMENT.md; README/AGENTS обоих репозиториев отражают Render topology.
Raw HAR/Trace и screenshots сохранены на диске, добавлены в frontend gitignore.
Исходные favicon-изменения и удаление backend PDF не затрагивались.

Проверки подготовки: frontend typecheck/lint/build успешны, 205 tests pass;
backend lint успешен, 308 tests pass после запуска вне sandbox для HTTP listen.
YAML syntax workflows проверен локально. GitHub Actions и Render deploy фактически ещё не запускались.
Commit/push, создание Render services, production env и DNS не выполнялись.
Пользователь подтвердил домен confidentdeveloper.space и Free backend на первом публичном запуске.
Эти решения записаны в DEPLOYMENT.md. URL нового backend, DNS provider и production env пока не настроены.
Публикация не закрывает незавершённые zoom/reduced-motion/device/browser проверки или PERF/UI/ENV findings.

## Полученная запись Chrome: localhost.har

Запись предоставлена пользователем: `http://localhost:4173/`, начало 2026-10-28 23:50:40 UTC.
В самом HAR 23 entries: 14 localhost, 6 Cloudinary, 3 Cloudflare.
Суммарный `_transferSize`: 1,396,418 B; content.size: 2,334,032 B.
DOMContentLoaded: 66.99 ms, Load: 67.07 ms; последняя запись завершается примерно через 239 ms от первого запроса.
Это другой запуск, чем сообщённые ранее 43 requests / 80 ms / Finish 254 ms.
Причина различия счётчика запросов пока не установлена; нельзя объявлять HAR полным отражением всех 43 строк UI.
Размеры совпадают с округлёнными 1.4 MB transfer / 2.3 MB resources.
Настройки Disable cache, throttling, viewport и отсутствие прокрутки не записаны пользователем отдельно,
поэтому это предварительная запись, не окончательный воспроизводимый baseline.

В HAR подтверждены:

- JS и CSS доставлены с gzip. Основной JS: 157,646 B transfer, CSS: 25,668 B.
- Inter: 349,254 B transfer, примерно 25% общего объёма.
- Три логотипа Home projects: 52,489 B transfer суммарно.
- Два Home preview (SuperSauced и Unicon): 262,916 B transfer; третьего preview в HAR нет.
- Эти previews имеют `loading="lazy"`; браузер начинает загрузку близких к viewport изображений заранее.
  Присутствие в Network до прокрутки само по себе не означает, что lazy не работает.
- Contact landscape: 141,080 B transfer, начинается примерно одновременно с Hero portrait, Low priority.
- Cloudflare Turnstile: три записи, 225,734 B transfer; включает challenge iframe.
- Один URL Hero portrait имеет две записи с ненулевым transfer по 72,882 B:
  инициаторы script и other. Это кандидат для проверки повторной загрузки img/favicon;
  причина и поведение при включённом кеше ещё не установлены.
- Пять стартовых GET и последующий interaction GET успешны; POST view и отправок форм в HAR нет.
- В этой записи нет загрузки Rive JS/WASM.

API стартуют примерно через 89–90 ms от начала документа. Project logos появляются в запросах после ответа list,
а два preview стартуют примерно через 162 ms. Часть запросов продолжается после события Load.
HAR не содержит измерения LCP, CLS или стоимости исполнения JS/плавности.
Нет доказательств, что ранние offscreen-ресурсы добавили несколько секунд к появлению Hero.
Следующее измерение: Performance-запись reload с screenshots, затем проверка при ограниченной сети.

Дата: 2026-10-28. Этап: initial load Home, без исправлений.

## Окружение и границы проверки

- Frontend HEAD: `f6f2d98`; backend HEAD: `4b1d3af`.
- Прочитаны frontend AGENTS.md, README.md и последние коммиты; backend README.md и история.
- Node.js 22.19.0, npm 10.9.3. Production-сборка выполнена через `npm run build`.
- Preview: `http://127.0.0.1:4173/`; backend уже работает на порту 3000.
- `GET /api/health`: 200, `database: connected`.
- Публичные GET через preview подтверждают работающий относительный `/api` proxy.
- Встроенный браузер недоступен; список браузеров пуст. Браузерный waterfall, cold/warm load, CPU, FCP, LCP, CLS, INP, визуальная готовность и взаимодействия НЕ измерены. Браузеры и размеры экранов пока не проверены.
- Использованы локальные HTTP-запросы и анализ исходников. Это не замена браузерному тесту и не модель задержек будущего хостинга/CDN.
- Сообщения, отзывы, лайки и просмотры вручную не отправлялись. Деплой не выполнялся.
- Существующие frontend-изменения `index.html` и удаление `public/favicon.svg` сохранены. В собранном HTML favicon указывает на PNG солнца с портретом, ресурс отвечает 200.
- В backend также есть существующее удаление PDF задания; оно не изменялось.

## Что отдаёт сервер

`GET /` возвращает 200 и 490 байт HTML. В body только пустой `#root`.
В head находятся title, viewport, favicon, один module script и один stylesheet.
Готовой разметки Hero/Navigation/секций в ответе нет: интерфейс создаётся React в браузере.
Без успешной загрузки и исполнения JS содержимое приложения не появится.

## Артефакты сборки

### Полученная Performance-запись

Файл: `Trace-20261028T202331.json.gz`, 2026-10-29 00:23:31 UTC.
Chrome DevTools, Responsive; основной viewport после применения meta viewport: 509 × 905 CSS px, DPR 2.
Это мобильная эмуляция на компьютере, не desktop и не реальный телефон.
Настройки throttling и Disable cache не подтверждены отдельной фиксацией.

Для navigationId `44D7F0EEC17CF05BCF1113A7CBDF4176`:

- DOMContentLoaded: 52.56 ms; Load: 52.65 ms от navigationStart.
- First Paint: 71.73 ms.
- FCP и единственный записанный LCP candidate: 1013.39 ms.
- Пользователь сообщил LCP 1.04 s в интерфейсе; сохраняем отдельно от рассчитанного времени trace event.
- LCP candidate: SPAN, nodeId 214, площадь 957; координаты соответствуют подписи Toronto у часов.
  Точного DOM textContent в этом событии нет; идентификация основана на rect и screenshots.
- На screenshot около 105 ms виден фон; на 304 ms уже видны портрет, заголовок, навигация и нижняя строка.
  К 999 ms видны также облака. Эти кадры показывают визуальное появление, но не доказывают завершение декодирования/интерактивность всего UI.
- На основном CrRendererMain нет RunTask > 50 ms; самая длинная задача около 28.7 ms.
- Событий LayoutShift в записи нет; это не общая гарантия отсутствия CLS на других сценариях.
- 19 ResourceMarkAsCached соответствуют встроенным data:image/svg+xml, а не доказательству тёплого HTTP-кеша.
  Это также объясняет возможность появления строк иконок без отдельных HTTP-загрузок.

Opening использует пространственные перемещения; браузер может не учитывать элементы,
первоначально отрисованные вне viewport и затем перемещённые внутрь, как новые LCP candidates.
Поэтому текущий LCP нельзя считать временем появления портрета или заголовка.
См. https://web.dev/articles/lcp#how_are_element_layout_and_size_changes_handled
Причина расхождения FCP со screenshots требует отдельной проверки; нельзя приписывать эту секунду сетевой задержке или блокировке JS.
Доказательств задержки Hero из-за Turnstile/landscape в этой записи не получено.
Следующий шаг: зафиксировать viewport/throttling/cache и повторить 3 раза в одинаковых условиях;
затем отдельно измерить desktop и ограниченную сеть/CPU.

Размеры в десятичных kB; gzip — оценка сборщика, а не наблюдаемый сетевой transfer.

| Ресурс | Размер | gzip |
| --- | ---: | ---: |
| Основной JS | 521.55 kB | 158.76 kB |
| Основной CSS | 145.07 kB | 25.38 kB |
| Inter variable WOFF2 | 348.93 kB | — |
| Hero portrait / favicon PNG | 72.61 kB | — |
| Contact landscape WebP | 140.81 kB | — |
| Локальный avatar WebP | 11.04 kB | — |
| Отложенный Rive JS | 297.54 kB | 76.18 kB |
| Отложенный Rive WASM | 2,128.71 kB | 899.57 kB |

Маршруты импортируются статически: основной JS включает код остальных страниц.
Rive выделен отдельно и по коду загружается при видимости соответствующего showcase в Services, а не на Home.
Часть небольших SVG встроена в bundle как data URL и не требует отдельного запроса.
Наличие файла в dist само по себе не доказывает его загрузку на Home.

Inter запрашивается через CSS, `font-display: swap` допускает сначала системный шрифт.
Портрет и landscape имеют обычные img без lazy. Аватар Profile появляется после данных.
Project home previews имеют `loading="lazy"`; момент их запроса определяет браузер.
Логотипы проектов и empty-state avatar приходят по URL из API.
Полный фактический набор изображений, приоритеты и дублирование запросов требуют waterfall.

## Стартовые API

Home монтирует все секции сразу, поэтому по коду первые пять GET запускаются после монтирования независимо от прокрутки.
Для каждого ниже проверен HTTP 200 через preview; это не запись браузерной сессии.

| GET | Назначение | Размер JSON |
| --- | --- | ---: |
| `/api/v1/projects?placement=home` | Featured projects | 5264 B |
| `/api/v1/services?placement=home` | Services preview | 1128 B |
| `/api/v1/github-summary` | Сохранённая статистика GitHub | 155 B |
| `/api/v1/profile-post` | Текст, revision, counters | 257 B |
| `/api/v1/references?page=1&limit=10` | Guestbook / empty state | 519 B |

После завершения загрузки GitHub summary и Profile Post hook запрашивает
`/api/v1/profile-post/interaction?revision=…` для персонального состояния лайка.
Этот GET в HTTP-проверке не выполнялся.
При сохранённом credential возможен дополнительный GET восстановления собственного отзыва.
`POST /api/v1/profile-post/view` предусмотрен только после видимости 90% карточки по IntersectionObserver.
Фактическую работу observer при анимации ещё нужно проверить в браузере.
GitHub напрямую браузером не запрашивается. Resume загружается по ссылке пользователя.

При заданном site key закрытый ContactDrawer уже содержит смонтированный ContactForm с TurnstileWidget.
По коду это вызывает загрузку внешнего Cloudflare script даже до открытия drawer.
`appearance: interaction-only` управляет внешним видом widget, но не откладывает useEffect.
В полученном позднее HAR подтверждены три Cloudflare-запроса общей стоимостью 225,734 B transfer.
Влияние на отрисовку и отзывчивость пока не измерено; исправление не внесено.

## Когда появляется интерфейс

Ожидаемая цепочка по коду: HTML → JS/CSS → выполнение React → Hero и состояния загрузки → данные и связанные изображения.
Hero использует локальные данные и не ждёт API. Inter может подменить временный шрифт после загрузки.
Начальная Home choreography рассчитана на 900 ms после запуска состояния открытия;
это НЕ измеренный FCP/LCP и не время от начала HTTP-навигации.
Скролл/навигация отменяют opening; reduced motion получает завершённое состояние.

## Первая загрузка, кеш и клиентская навигация

- Первая загрузка без кеша: необходимы документ, начальные ресурсы и выполнение JS; API стартуют после монтирования.
- Обычная повторная загрузка: React запускается заново, эффекты снова запрашивают данные; HTTP-кеш может переиспользовать тела ресурсов после проверки актуальности.
- Preview отдаёт проверенные HTML/JS/CSS/WOFF2/PNG с `Cache-Control: no-cache` и ETag. Это разрешает хранение, но требует проверки перед повторным использованием; это не `no-store`.
- Условный запрос с совпавшим ETag может получить 304 без тела. Сам сценарий браузерного кеша ещё не проверен.
- Публичные API имеют `max-age=0`; `s-maxage` предназначен общим кешам/CDN: 60 s для projects/services/GitHub, 15 s для post, 30 s для references. Локальное preview не является таким CDN.
- Клиентская навигация сохраняет layout и загруженный JS/CSS; новый HTML не требуется. Возврат на Home монтирует секции и повторяет их загрузчики, без повторного opening. Это вывод по коду, не проверенный браузерный сценарий.
- Back/Forward, восстановление scroll и bfcache проверяются отдельно; их нельзя считать эквивалентом обычного reload.

## Итог и следующий шаг

Build, typecheck и lint проходят. Сборщик предупреждает об основном JS более 500 kB;
это повод измерить стоимость загрузки/исполнения, а не основание автоматически менять архитектуру.
Подтверждённых пользовательских дефектов на этом этапе не установлено.
Кандидаты для измерения: общий JS/CSS, размер шрифта, ранний landscape, Turnstile закрытого drawer.
Утверждённый дизайн и непрозрачная подложка Services не меняются.

Следующий шаг: вместе с пользователем записать в Chrome DevTools Home без прокрутки в cold/warm сценариях и после клиентского возврата,
с одинаковыми viewport, CPU/network условиями и временем ожидания. Снять Network/Performance,
FCP/LCP/CLS, ошибки Console, число/объём запросов и момент визуальной готовности.
До этого сравнительный baseline производительности остаётся неполным.
Дальнейшие этапы: маршруты/формы/ошибки → доступность → браузеры/размеры → согласованные исправления и повторные измерения → конкретный план хостинга без деплоя.

## Реестр кандидатов и план исправлений

### Desktop initial load: Trace-20261028T203317.json.gz

Запись 2026-10-29 00:33:17 UTC, localhost:4173, Responsive 1440 × 991 CSS px, DPR 2,
около 5.06 s. Пользователь показал настройки Performance: CPU и Network No throttling,
Screenshots включён. Это текущие показанные настройки; их неизменность с начала записи
и Disable cache отдельно не подтверждены. Не смешиваем с предыдущим узким viewport.

- DOMContentLoaded 56.20 ms, Load 56.29 ms, First Paint 69.39 ms.
- FCP и единственный LCP candidate: 1027.72 ms (соответствует 1.03 s на screenshot).
- Точный LCP nodeName: SPAN с классом `_keepBuilding_…`; это декоративный KEEP BUILDING.
- Кадр ~99 ms: фон. К ~295 ms видны Hero, навигация, портрет и нижняя строка;
  к ~993 ms видны облака. Анимация входит в запись; появление на кадре не равно её завершению.
- На основном потоке нет RunTask > 50 ms; максимум 30.74 ms около 57 ms от navigationStart.
- Суммарный RunTask основного потока около 144.9 ms за запись.
  Эта сумма не означает одну блокировку и не включает всю работу compositor/GPU/iframe.
- LayoutShift events не обнаружены; Chrome UI показывает CLS 0.
- HTTP-ресурсов с ResourceMarkAsCached не найдено; этот факт не заменяет фиксацию настроек кеша.

Вывод: в данном локальном запуске нет подтверждения длительной блокировки основного потока.
LCP относится к декоративному тексту и не отражает напрямую появление главного заголовка/портрета.
Сравнение с предыдущей мобильной записью — наблюдение, не доказательство одинаковой производительности.
Плавность на других устройствах, при прокрутке и при ограниченных ресурсах ещё не проверена.
Следующий шаг: два повтора desktop reload с теми же настройками и подтверждённым Disable cache,
затем повтор с кешем; после базовых замеров — ограниченная сеть/CPU.

### Повторяемость desktop initial load: три запуска

Пользователь переименовал исходные записи в `Trace-desktop1.json.gz` и `Trace-mobile.json.gz`,
добавил `Trace-desktop2.json.gz` и `Trace-desktop3.json.gz` после инструкции сохранять
1440 × 991, No throttling CPU/network, Disable cache и не взаимодействовать во время reload.
Все три desktop trace подтверждают viewport 1440 × 991 и DPR 2.

| Показатель | Desktop 1 | Desktop 2 | Desktop 3 |
| --- | ---: | ---: | ---: |
| DOMContentLoaded | 56.20 ms | 54.16 ms | 54.68 ms |
| Load | 56.29 ms | 54.25 ms | 54.78 ms |
| First Paint | 69.39 ms | 69.00 ms | 73.02 ms |
| FCP / LCP | 1027.72 ms | 1019.00 ms | 1023.02 ms |
| Max main-thread RunTask | 30.74 ms | 30.69 ms | 30.27 ms |
| Main-thread tasks > 50 ms | 0 | 0 | 0 |
| LayoutShift events | 0 | 0 | 0 |

Во всех трёх LCP candidate — KEEP BUILDING. Медиана LCP 1023.02 ms,
диапазон 1019.00–1027.72 ms, разброс 8.72 ms. Сценарий в этих условиях повторяется стабильно.
POST-запросов в этих trace не обнаружено.
Ограничения: первая запись сделана до явной фиксации Disable cache; отсутствие HTTP cache markers
не доказывает одинаковое начальное состояние кеша. Отключение кеша не сбрасывает все DNS/TLS/CDN кеши.
Это baseline локального reload без искусственного замедления, а не прогноз production/mobile.

Следующий сценарий: включить обычный HTTP-кеш (снять Disable cache), выполнить один reload для прогрева,
затем записать ещё один reload в Performance с теми же viewport/CPU/network и экспортировать
`Trace-desktop-cached.json.gz`. Проверить фактическое переиспользование ресурсов/304 и изменение timings.
После этого отдельно клиентский уход с Home и возврат через навигацию, без document reload.

### Desktop reload с кешем: Trace-desktopCache.json.gz

Дата: 2026-10-29 00:46:23 UTC; viewport 1440 × 991, DPR 2.
По инструкции пользователя перед записью включён кеш и выполнен прогрев.

| Показатель | Без кеша: медиана трёх desktop | С кешем: один запуск |
| --- | ---: | ---: |
| DOMContentLoaded | 54.68 ms | 43.62 ms |
| Load | 54.78 ms | 43.71 ms |
| First Paint | 69.39 ms | 56.42 ms |
| FCP | 1023.02 ms | 114.75 ms |
| LCP | 1023.02 ms | 1006.41 ms |
| Max main-thread RunTask | 30.69 ms | 30.44 ms |
| Tasks > 50 ms | 0 | 0 |
| LayoutShift events | 0 | 0 |

LCP по-прежнему KEEP BUILDING. В кадре ~121 ms видна начинающая входить навигация;
к ~297 ms видны Hero и нижняя строка. Резкое изменение FCP нельзя трактовать как
девятикратное ускорение всего Hero: метрика чувствительна к первому учитываемому содержимому
во время opening, визуальная последовательность остаётся сходной.

Подтверждено переиспользование ресурсов: Cloudinary и часть Cloudflare имеют fromCache=true;
JS/CSS/WOFF2/portrait/landscape завершаются с encodedDataLength всего 127–179 B при полном decodedBodyLength.
Это согласуется с проверкой актуальности сохранённых тел, а не повторной передачей полных файлов.
Response events показывают итоговый status 200; утверждать конкретный wire-status 304 по ним нельзя.
Часть API сначала выдаётся с fromCache=true, затем повторно запрашивается по сети;
это согласуется с stale-while-revalidate. Точную причину нужно сверять с заголовками HAR.
Interaction и References также продолжают обращаться к сети; наличие кеша не означает отсутствие запросов.

Сумма ResourceFinish.encodedDataLength за trace: 196,838 B. Это показатель trace,
не идентичный Network footer transferred из другой HAR-записи.
Одна cached-запись подтверждает работу кеша, но ещё не статистический диапазон warm-load.
Следующий шаг — клиентский переход Home → Services index → Home обычной кнопкой Record,
без reload, с паузами и без открытия service detail/форм. Проверить отсутствие нового документа,
повторного opening и повторной передачи основных JS/CSS, а также повторные запросы данных Home.

### Клиентская навигация: Trace-desktopTransitionCache.json.gz

Дата 2026-10-29 00:53:14 UTC; сценарий Home → Services index → Home с обычной Record,
кеш включён, без reload. Длительность активного окна около 8.66 s.

- Новых navigationStart основного документа нет; навигации iframe Cloudflare не являются reload сайта.
- Основные index JS/CSS и шрифт повторно не запрашиваются.
- Services list загружается после выхода Home; при возврате запускаются пять Home GET и interaction GET.
  Часть запросов сначала получает кешированное представление и затем ответ сети.
- Кешированные изображения проектов переиспользуются; локальные portrait/landscape/avatar снова
  проходят запросы проверки актуальности. Это не повторная передача всех байтов приложения.
- При возврате Home создаётся новый Turnstile iframe и выполняется Cloudflare challenge-запрос:
  дополнительное наблюдение к PERF-01. Script API повторно не загружается.
- CSS Animation events показывают global route/cloud motion и stagger Services в обе стороны.
  Повторных initial-drop/opening animations при возврате Home не найдено.
- Самый длинный RunTask основного renderer — 13.735 ms; задач >50 ms нет; LayoutShift events нет.
- Два click EventTiming имеют duration около 27.6/27.7 ms. Это длительность отдельных событий,
  не полное время route choreography и не репрезентативный полевой INP.
- Скриншоты достигли лимита 450 кадров примерно через 4.82 s, до возврата Home около 5.14 s.
  Визуально подтверждены исходный Home и Services. Финальный Home оценён по событиям/запросам,
  не по отсутствующим финальным screenshots. Повторная запись только ради этого пока не нужна.
- POST-запросов не обнаружено; формы и service detail не открывались.

Desktop initial-load, reload с кешем и клиентская навигация имеют предварительные baseline.
Это не завершение аудита desktop-взаимодействий/доступности или проверка кадров на слабом GPU.
Следующий шаг: mobile initial load с явно зафиксированными viewport, DPR, CPU/network и кешем,
затем mobile warm reload и переходы через burger. Ограниченные сеть/CPU измеряются отдельно.

### Mobile initial load: Trace-mobile1.json.gz

Дата 2026-10-29 00:57:10 UTC. Responsive, итоговый viewport 390 × 844 CSS px, DPR 2.
По инструкции сценарий выполнен без CPU/network throttling и с Disable cache.
Это эмуляция на компьютере, не реальный телефон.

- DOMContentLoaded 56.41 ms; Load 56.48 ms; First Paint 73.21 ms.
- FCP/LCP 1023.20 ms; единственный LCP candidate — SPAN nodeId 214,
  rect [309,788]–[374,802], соответствует подписи Toronto у часов.
- Самый длинный RunTask основного потока 28.33 ms; задач >50 ms нет.
- LayoutShift events нет. POST-запросов и ResourceFinish.didFail=true нет.
- К ~306 ms на кадре видны портрет, заголовок, навигация и нижняя строка;
  около 997 ms видны облака. Opening включён в запись.
- 19 HTTP ResourceSendRequest; сумма ResourceFinish.encodedDataLength 1,199,978 B.
- В trace загружается только одно project preview (SuperSauced), три project logo;
  это согласуется с нативной lazy loading и горизонтальной мобильной компоновкой.
- Turnstile API script ответил 200, но challenge iframe-запроса в этой записи нет.
  Причина не установлена; полную готовность Turnstile этой записью не подтверждаем.
  Поэтому разницу общего объёма с desktop нельзя целиком приписать responsive-оптимизации.
- Landscape по-прежнему загружается при initial load; PERF-02 сохраняется.

Вывод: мобильная компоновка не показала длительных main-thread блокировок в этом запуске
на компьютере без замедления; вывод о скорости реального телефона не делаем.
Следующий шаг: два повтора в тех же условиях, затем warm reload и mobile client navigation.
После базовых сценариев отдельно ограниченная сеть/CPU; форма без согласования не отправляется.

### Повторяемость mobile initial load: три запуска

`Trace-mobile1.json.gz`, `Trace-mobile2.json.gz`, `Trace-mobile3.json.gz`.
Все три подтверждают итоговый viewport 390 × 844 CSS px, DPR 2.
Условия по инструкции: CPU/network No throttling, Disable cache, reload без взаимодействий.

| Показатель | Mobile 1 | Mobile 2 | Mobile 3 |
| --- | ---: | ---: | ---: |
| DOMContentLoaded | 56.41 ms | 56.24 ms | 52.28 ms |
| First Paint | 73.21 ms | 75.06 ms | 71.78 ms |
| FCP / LCP | 1023.20 ms | 1025.06 ms | 1013.44 ms |
| Max main-thread RunTask | 28.33 ms | 31.99 ms | 26.91 ms |
| Tasks > 50 ms | 0 | 0 | 0 |
| LayoutShift events | 0 | 0 | 0 |
| Sum ResourceFinish.encodedDataLength | 1,199,978 B | 1,205,013 B | 1,201,502 B |

Медиана LCP 1023.20 ms, диапазон 1013.44–1025.06 ms, разброс 11.62 ms.
LCP во всех трёх — SPAN; Mobile 1 по координатам соответствует подписи Toronto.
POST и ResourceFinish.didFail не обнаружены.
Во всех трёх два ResourceSendRequest для Turnstile API (исходный URL и версия после redirect),
challenge iframe-запрос не обнаружен. Уточнение предыдущего счётчика: 20 HTTP send events,
19 уникальных requestId; при redirect один requestId используется повторно.
Отсутствие iframe повторяется; это наблюдение для проверки готовности/ошибок формы,
не доказательство неисправной защиты и не подтверждение успеха проверки.

Baseline mobile reload без кеша стабилен на данном компьютере; вывод о реальном телефоне не делаем.
Следующий шаг: снять Disable cache, выполнить обычный reload для прогрева, затем записать reload
с теми же условиями как `Trace-mobileCache.json.gz`. После — переходы через burger,
далее отдельный сценарий ограниченных CPU/сети.

### Mobile reload с кешем: Trace-mobileCache.json.gz

Дата 2026-10-29 01:01:07 UTC; итоговый viewport 390 × 844, DPR 2.
Сценарий по инструкции: кеш включён и прогрет, CPU/network без замедления.

- DOMContentLoaded 40.61 ms; Load 40.70 ms; First Paint 58.41 ms.
- FCP 90.25 ms; LCP 1000.07 ms, SPAN, площадь 949 (совпадает с размером подписи Toronto в cold-записях).
- Max main-thread RunTask 29.14 ms, задач >50 ms нет; LayoutShift events не найдены.
- Локальные JS/CSS/WOFF2/portrait/landscape имеют небольшие encodedDataLength в ответах 127–179 B;
  Cloudinary и Turnstile script имеют fromCache=true. Кеширование ресурсов подтверждено.
- Некоторые API сначала отдают cached response, затем обновляются по сети; interaction/references также идут по сети.
- Sum ResourceFinish.encodedDataLength: 198,619 B против медианы cold 1,201,502 B.
  Это сумма событий trace; она не обязана совпадать с Network footer transfer и не является размером всех распакованных ресурсов.
- POST и ResourceFinish.didFail не найдены. Challenge iframe по-прежнему не обнаружен;
  готовность Turnstile остаётся отдельной проверкой формы.

Вывод: переиспользование ресурсов работает и на mobile-компоновке.
LCP остаётся около 1 s из-за выбранного кандидата в opening; не трактуем FCP-разницу как
пропорциональное ускорение полного Hero. Один warm-запуск не задаёт статистического диапазона.
Следующий шаг — mobile client navigation через burger Home → Services → Home с обычной Record,
кеш включён; проверка отсутствия document reload, повторного opening, лишних JS/CSS и долгих main tasks.

### Mobile client navigation: Trace-mobileTransitionCache.json.gz

Дата 2026-10-29 01:18:43 UTC, viewport 390 × 844, DPR 2; окно записи около 10.82 s.
Кеш включён, сценарий через burger Home → Services → Home.

- Два открытия меню и два выбора маршрута: click EventTiming duration около 27–30 ms.
  Это отдельные взаимодействия, не репрезентативный полевой INP и не полная длительность меню.
- Max RunTask основного renderer 24.78 ms; задач >50 ms и LayoutShift events нет.
- У frame приложения нет document navigationStart, основной JS/CSS/font не загружаются повторно.
  Пустая navigationStart другого top-level frame не относится к приложению;
  Cloudflare iframe navigation также не является перезагрузкой сайта.
- Services list запрашивается при переходе, пять Home loader GET и interaction — при возврате.
- События CSS transitions соответствуют открытию/закрытию меню; повторной initial-drop choreography
  и desktop route/cloud spatial animations не обнаружено.
- При возврате Home вновь есть Cloudflare challenge iframe request: подтверждение PERF-01 и на mobile.
  Отсутствие такого запроса в mobile reload-записях не означает, что mobile всегда его пропускает.
- ResourceFinish.didFail не найдено; POST не обнаружены в списке сетевых запросов.
- Screenshots показывают Home, открытое меню и Services. Лимит 450 кадров достигнут к 4.81 s,
  возврат на Home около 7.90 s визуально не захвачен; подтверждён событиями и API.

Baseline initial load / cached reload / client navigation получен для desktop и mobile layout.
Слабые CPU/сеть, реальный телефон, scroll/interactions, функциональный и accessibility аудит ещё впереди.
Следующий шаг: mobile initial load CPU 4× slowdown при неизменной сети No throttling,
Disable cache, 390 × 844 DPR 2; сначала меняем один фактор, затем отдельно ограничиваем сеть.

### Mobile CPU 4×: Trace-mobileCPU4X.json.gz

Дата 2026-10-29 01:21:16 UTC; 390 × 844, DPR 2. metadata.cpuThrottling=4 подтверждено.
По инструкции сеть No throttling, Disable cache. Меняем только вычислительные ресурсы.

- DOMContentLoaded 103.84 ms; Load 103.91 ms; First Paint 126.06 ms.
- FCP/LCP 1184.39 ms, SPAN площадью 949 (как подпись Toronto в предыдущих mobile trace).
- Одна main-thread RunTask 111.93 ms, начинается ~106.7 ms; остальные <50 ms.
- Внутри этой задачи Layout 38.795 ms. Стек указывает на minified Od в основном bundle:
  функция пишет textarea.style.height='auto', затем читает getComputedStyle/scrollHeight
  и снова пишет height/overflowY. Код соответствует autosize в ReferenceComposer.
- Важно: 111.93 ms — вся задача инициализации, а не исключительно textarea или layout;
  38.795 ms вложенного Layout нельзя прибавлять к 111.93 ms как независимый расход.
- Screenshot около 300 ms показывает входящие сверху элементы, около 601 ms — Hero и нижнюю строку.
  На компьютере без throttling они уже видны около 306 ms; сравнение качественное по отдельным кадрам.
- LayoutShift events, POST и ResourceFinish.didFail не найдены.
- Sum ResourceFinish.encodedDataLength 1,192,213 B, сопоставимо с cold mobile baseline.

Вывод: найден измеренный участок стартовой main-thread работы >50 ms при замедлении.
Это один stress-run; повторяемость и влияние на реальные взаимодействия ещё не установлены.
Следующий шаг: отдельно ограничить сеть, вернув CPU No throttling, затем при необходимости
повторить CPU stress для проверки кандидата PERF-03.

### PERF-03: стартовая задача и синхронный layout при autosize References composer

Статус: кандидат для исследования по подтверждённой long task в одном CPU4× trace; исправлений нет.
Наблюдение: initial Home mount занимает main-thread task ~112 ms, включая ~39 ms Layout,
вызванный измерением textarea ReferenceComposer ниже Hero после записи style.height.
Запись/чтение layout в useLayoutEffect может принудительно завершать накопленный layout всей страницы;
это не означает, что сама textarea стоит все 39 ms или что удаление измерения устранит всю задачу.
Проверка: повтор CPU4× в тех же условиях, оценка стека и момента первого paint,
затем решение, можно ли сократить/перенести начальные измерения без изменения autosize,
keyboard Enter/Shift+Enter, ошибок и responsive поведения composer.
Критерий улучшения: меньше стартовой main-thread работы при сохранении этих сценариев,
а не только уменьшение LCP декоративного элемента. Конкретная реализация пока не выбрана.

### Mobile Fast 4G: Trace-mobile4GFast.json.gz

Дата 2026-10-29 01:24:25 UTC; 390 × 844, DPR 2. metadata подтверждает Fast 4G:
download 1,012,500 B/s, upload 168,750 B/s, latency 165 ms, targetLatency 60 ms.
CPU throttling metadata отсутствует; по инструкции CPU No throttling, Disable cache.
Активное окно около 5.56 s (меньше запрошенных 10 s, но включает завершение всех показанных ресурсов).

- DOMContentLoaded 553.14 ms; Load 553.20 ms; First Paint 571.24 ms; FCP 779.57 ms.
- LCP 1037.91 ms, теперь IMG portrait, площадь 23,104: кандидат изменился относительно cold No throttling.
  imageDiscoveryTime 580.6 ms, imageLoadStart 581.7 ms, imageLoadEnd 1021.4 ms.
- JS завершает загрузку ~539 ms; портрет обнаруживается после запуска приложения, а не при разборе исходного HTML.
- CSS завершён ~406 ms; Inter начинается ~565 ms и завершён ~1728 ms.
- Landscape начинается ~582 ms, заканчивается ~1300 ms; project preview ~799–1466 ms.
- Turnstile API и challenge iframe загружаются; iframe завершается ~1791 ms.
- Max main-thread RunTask 28.49 ms, задач >50 ms нет; LayoutShift events нет.
- Кадр ~557 ms показывает фон; ~995 ms — заголовок/навигацию и частично появившийся портрет;
  ~1504 ms — портрет и облака. К ~2003 ms виден текст после завершения загрузки Inter.
  Кадры не задают точное время окончания анимации и не заменяют frame-budget анализ.
- HTTP ResourceFinish.didFail и POST не обнаружены.

Вывод: при ограниченной сети заметно откладывается запуск приложения/появление Hero,
хотя LCP близок к прежней секунде. Сравнивать это число напрямую с LCP подписи Toronto некорректно:
разные кандидаты. Необычно меньший FCP также не означает более быструю загрузку — раньше учтён другой контент.
Подтверждена зависимость обнаружения Hero portrait от JS и поздняя загрузка шрифта;
выбор оптимизации (приоритеты, preload, размер шрифта и др.) пока не сделан.
Конкуренция landscape/Turnstile с Hero возможна, но выигрыш их переноса ещё не измерен.
Следующий шаг: один combined stress-run CPU4× + Fast4G при том же viewport и Disable cache,
затем свести итоги initial-load этапа и перейти к остальным сценариям производительности.

### Mobile CPU4× + Fast4G: Trace-mobileCpuNetwork.json.gz

Дата 2026-10-29 01:30:17 UTC; 390 × 844, DPR 2. metadata подтверждает CPU4× и Fast4G
с теми же сетевыми параметрами, что в network-only trace. Активная запись ~5.60 s;
содержит окончание показанных сетевых загрузок, хотя инструкция предлагала около 10 s.

- DOMContentLoaded 601.77 ms; Load 601.84 ms; First Paint 618.10 ms; FCP 901.43 ms.
- LCP 1134.76 ms, IMG portrait. Discovery 707.6 ms, load start 708.7 ms, image load end 1105 ms.
- Одна main-thread task 110.05 ms около 604 ms, внутри Layout 37.7 ms со стеком того же Od autosize composer.
  Это повторяет PERF-03 при ином сетевом условии; точная доля устранимой работы ещё неизвестна.
- JS завершён ~546 ms; Inter ~1771 ms; landscape ~1409 ms; preview ~1634 ms; challenge iframe ~2028 ms.
- LayoutShift events, POST и ResourceFinish.didFail не найдены.
- Кадры около 1000 и 1492 ms сохранены для визуального сопоставления с network-only trace.

### Итог подэтапа initial load Home

Получены baseline desktop/mobile reload без кеша (по три запуска), с кешем (по одному),
client navigation с кешем (по одному), mobile CPU4×, Fast4G и combined (по одному).
Desktop 1440 × 991, mobile 390 × 844, DPR 2; единственный проверенный браузер — пользовательский Chrome,
mobile — эмуляция на компьютере. Safari/Firefox/реальные телефоны и хостинг не проверены.

| Mobile сценарий | DOMContentLoaded | LCP | LCP candidate | Max main task |
| --- | ---: | ---: | --- | ---: |
| Без замедления, cold median | 56.24 ms | 1023.20 ms | Подпись Toronto | 28.33 ms |
| CPU4× | 103.84 ms | 1184.39 ms | SPAN, как подпись Toronto | 111.93 ms |
| Fast4G | 553.14 ms | 1037.91 ms | Portrait | 28.49 ms |
| CPU4× + Fast4G | 601.77 ms | 1134.76 ms | Portrait | 110.05 ms |

LCP разных кандидатов не сравниваем как скорость появления одного и того же содержимого.
Подтверждены: работа кеша, отсутствие document reload при route navigation,
ранние offscreen ресурсы, зависимость обнаружения portrait от JS,
повторяемая стартовая long task при CPU4× с синхронным layout в autosize References.
Выигрыш предлагаемых оптимизаций не измерен, изменения в код не вносились.
Реестр: PERF-01 Turnstile, PERF-02 landscape, PERF-03 startup/layout; bundle/font/portrait discovery
остаются дополнительными наблюдениями для выбора решения после исходного аудита.

Следующий подэтап производительности — прокрутка Home после полной загрузки:
при No throttling CPU/network и включённом кеше записать обычной Record спокойную
прокрутку Hero → Contact без открытия форм, затем анализировать задачи/кадры и view API.
Посещение Profile штатно может автоматически отправить POST view и обновить реальный счётчик;
этот побочный эффект следует заранее объяснить пользователю. Сообщения/отзывы не отправлять.
Производительность остальных маршрутов и interactions, функциональный аудит, accessibility,
browser/device matrix и план тестового Render всё ещё остаются в общей программе.

### Mobile 3G: Trace-mobile3G.json.gz — незавершённая загрузка

Дата 2026-10-29 01:34:09 UTC. Responsive mobile, DPR 2; CPU без throttling по инструкции.
metadata: 3G download/upload 50,000 B/s (около 400 kbit/s), latency 2000 ms,
targetLatency 400 ms. Это конкретный искусственный профиль, не характеристика всех сетей 3G.
Активная запись 12.78 s, заканчивается примерно через 5 s после Load.

- HTML завершается ~2032 ms; CSS ~5088 ms; JS ~7761 ms.
- DOMContentLoaded 7774.92 ms, Load 7774.99 ms; First Paint 5602.40 ms.
- FCP и текущий LCP candidate 8735.72 ms; SPAN nodeId 119 у Toronto по rect.
  Это НЕ окончательный LCP полностью загруженного Hero: portrait ещё не завершил загрузку к остановке.
- Portrait обнаруживается/запрашивается около 7801 ms; landscape стартует ~7802 ms,
  Inter ~7787 ms, API и Turnstile ~7806–7808 ms.
- Кадр ~5594 ms: фон; ~10001 ms: текст/навигация/облака, портрета ещё нет;
  к ~12743 ms портрет виден частично. Скриншоты не подтверждают полностью готовый Hero.
- Max main RunTask 26.51 ms; задач >50 ms и LayoutShift events нет.
- К концу записи не завершены portrait, Inter, landscape, часть project media/avatars,
  interaction и Turnstile API. Отсутствие завершения не означает сетевую ошибку.

Вывод: подтверждено длительное ожидание видимого содержимого на медленной сети.
Принципиальная задержка до Hero — получение основного JS; отложенное обнаружение portrait добавляет
последовательный сетевой этап. Ранние offscreen загрузки стартуют уже ПОСЛЕ этой исходной задержки,
поэтому перенос только landscape/Turnstile не устранит ожидание JS до ~7.76 s.
После старта они могут конкурировать с portrait/font, но точный выигрыш требует сравнения после изменений.

Для полного сценария нужна запись обычной Record, затем ручной reload (не ограниченная автоматически
Record and reload), до завершения запросов, ориентировочно 30–45 s или дольше по фактической сети.
Финальный LCP, portrait/font finish и длительность загрузки пока неизвестны.

### Обновлённая 3G-запись: LCP портрета около 18 s

Пользователь заменил `Trace-mobile3G.json.gz`; новая дата 2026-10-29 01:37:40 UTC.
Профиль 3G тот же. Активное окно от navigationStart около 19.42 s.

- HTML ~2020 ms; CSS ~5077 ms; JS ~7750 ms.
- DOMContentLoaded 7756.69 ms; Load 7756.75 ms; First Paint 5600.36 ms; FCP 8700.34 ms.
- Первый LCP candidate — SPAN в 8700.34 ms; второй — Hero portrait в 18025.28 ms.
- Portrait discovery 7770.3 ms; load start 7770.9 ms; load end 18008.7 ms.
  Ожидание от начала запроса до окончания изображения около 10.24 s.
- Max main RunTask 27.41 ms, >50 ms нет; LayoutShift events нет; POST нет.
- Запись всё ещё не включает завершение Inter, landscape, project preview, Turnstile challenge iframe
  и ещё одного запроса URL portrait (отдельный requestId, возможно favicon).
  18.03 s — последний наблюдаемый LCP, а не гарантия окончательного значения полной сессии.
- Screenshot capture заканчивается примерно через 10.23 s после navigationStart;
  поздний paint портрета подтверждён trace event, не screenshot на 18-й секунде.

Исходная задержка JS ~7.75 s повторяется. Эта запись достаточно подтверждает проблему PERF-04:
даже с быстрым CPU текст и главный образ требуют длительного ожидания в данном строгом сетевом профиле.
Позднее обнаружение portrait и параллельная загрузка offscreen ресурсов/font — направления проверки,
но точный вклад каждого и эффект изменений не определены.
Полный сетевой tail нужно захватить при повторном сравнении до/после, записывая до окончания запросов.
Переходим к исходному измерению scroll; initial-load baseline имеет явно отмеченное ограничение 3G tail.

### PERF-04: доставка начального приложения и позднее обнаружение Hero portrait

Статус: подтверждённая задержка при 3G; кандидат на оптимизацию, без реализации.
Факты: основной JS ~158 kB transfer (общий bundle всех статически импортированных маршрутов),
в 3G trace заканчивается к ~7.76 s; Hero portrait впервые запрашивается к ~7.80 s.
При Fast4G и combined также подтверждается зависимость старта portrait от исполнения приложения.
Цель будущего изменения: раньше показать полезный первый экран и загрузить ключевое изображение,
сохранив дизайн/opening и не превратив ненужные ресурсы в высокоприоритетные.
Направления для оценки: размер начального route bundle, доставка CSS/font, раннее обнаружение portrait.
Конкретное решение (route splitting/preload и др.) пока не выбрано и не внедрено.
Проверка до/после: те же 3G/Fast4G и cache conditions, первый полезный кадр, portrait finish,
LCP с идентификацией кандидата, CPU startup и route transitions. Не обещать выигрыш без измерения.

### Прокрутка Home: desktopScroll и mobileScroll

`Trace-desktopScroll.json.gz`: 2026-10-29 01:43:32 UTC, около 12.82 s, 1440 × 1080 CSS px DPR 2
(высота изменилась относительно initial-load 991 px). `Trace-mobileScroll.json.gz`:
2026-10-29 01:42:10 UTC, около 13.22 s, 390 × 844 DPR 2. По инструкции No throttling и кеш включён.

| Показатель | Desktop scroll | Mobile scroll |
| --- | ---: | ---: |
| Max main-thread RunTask | 22.52 ms | 19.29 ms |
| Main tasks >50 ms | 0 | 0 |
| LayoutShift events | 0 | 0 |
| DroppedFrame markers | 36 | 53 |
| Из них hasPartialUpdate=true | 32 | 53 |
| Из них hasPartialUpdate=false | 4 | 0 |

Счётчики DroppedFrame — маркеры Chrome, не автоматически число полностью потерянных кадров.
В основном отмечены partial updates; на desktop есть четыре маркера без partial update.
Не вычисляем FPS/процент потерь делением на все BeginFrame/DrawFrame: нужны корректные frame boundaries
и учёт compositor/partial frames. Main task <50 ms не гарантирует укладывание в бюджет каждого кадра.
Причина маркеров (сайт, compositor/GPU, запись screenshots, окружение) ещё не локализована.

Во время этих записей нет новых HTTP-загрузок медиа; единственный HTTP-запрос в каждой —
автоматический POST `/api/v1/profile-post/view` при прокрутке к Profile.
В ОБОИХ случаях ответ 403. Это функциональная находка, несмотря на отсутствие ResourceFinish.didFail:
HTTP-ошибка может успешно завершиться на транспортном уровне.
Сообщения и отзывы не отправлялись.
Screenshots достигают лимита 450 около 4.7 s: desktop визуально захватывает Projects/Services,
mobile — до заголовка Profile; поздние секции визуально по этим screenshot не оценены.

### ENV-01: preview origin и HTTP 403 при регистрации Profile view

Статус: подтверждён HTTP 403 в обеих scroll trace; предполагаемая причина конфигурации найдена.
Backend `.env` содержит CLIENT_ORIGIN=http://localhost:5173; frontend preview работает на localhost:4173.
Backend requireTrustedOrigin возвращает 403 для отсутствующего или неразрешённого Origin.
Это согласуется с ошибкой и требует проверки действующего process environment/ответа перед окончательной атрибуцией.
Не ослаблять Origin-защиту. Для полноценной проверки mutations в preview нужен явный allowlist,
включающий фактически используемые локальные origin, с перезапуском backend.
Backend `.env` и процесс не изменялись. Пользователь ранее сообщил, что пока наблюдаем без исправлений.
После настройки проверить Profile view и другие origin-защищённые действия; реальную отправку форм
не выполнять без отдельно согласованного тестового окружения.

Промежуточный вывод scroll: длительной main-thread блокировки не обнаружено, идеальная плавность
не подтверждена из-за frame markers и отсутствия реального mobile device.
Следующий шаг — сопоставить маркеры с субъективно замеченными рывками и при необходимости снять
короткий целевой интервал с меньшими накладными расходами записи; затем продолжить route/interactions baseline.

Обратная связь пользователя после просмотра обеих scroll-записей: прокрутка ощущается хорошо,
плавно и приятно; заметных рывков не сообщено. Это качественная оценка в текущем окружении,
а не измерение на реальном телефоне или гарантия для слабого GPU.
Frame markers сохраняем как техническое наблюдение; отдельный фикс плавности или повторный scroll trace
сейчас не обоснован. ENV-01 остаётся независимой подтверждённой HTTP-ошибкой.
Следующий сценарий baseline — прямая загрузка dedicated Projects, затем Services с showcase;
проверять фактический slug, redirects, LCP candidate и загрузку медиа, сохраняя ограничения отправки форм.

### Projects direct load: Trace-desktopProjects.json.gz

Дата 2026-10-29 01:50:25 UTC, URL /projects/unicon, viewport 1440 × 1080 DPR 2
(не 991 px высотой). CPU/network без throttling по инструкции, Disable cache включён.

- DOMContentLoaded 55.13 ms; Load 55.20 ms; First Paint 73.41 ms; FCP 98.41 ms.
- LCP сначала heading в 98.41 ms, затем screenshot IMG (loading=lazy) в 273.40 ms, площадь 160,564.
- Max main RunTask 20.02 ms, задач >50 ms нет.
- Список /api/v1/projects и detail /api/v1/projects/unicon стартуют одновременно ~79 ms,
  заканчиваются ~130–132 ms. Контракт параллельной загрузки прямого detail подтверждён.
- Все 3 project screenshots запрашиваются ~137–141 ms и завершаются ~224–227 ms;
  при этом viewport показывает несколько панелей. Lazy у соседних панелей не запрещает раннюю загрузку.
- Три tab logo загружаются отдельно; общий Sum ResourceFinish.encodedDataLength 907,815 B.
- ResourceReceiveResponse всех HTTP-запросов 200; ResourceFinish.didFail не обнаружен, POST нет.
- Home-specific APIs, Turnstile и Rive не запрашиваются. Основной JS/CSS всё ещё общий route bundle.
- Только cloud-drift Animation events; глобальная slide/capsule entrance на direct load не запускается.
- Кадр ~99 ms: title + Loading projects; ~305 ms: browser со screenshot и metadata.

Обнаружены два LayoutShift events: ~84.72 ms (nav/text, score 0.00060),
~139.88 ms (surface смещается вверх на 80 физических px, около 40 CSS px, score 0.01827).
У обоих had_recent_input=true и cumulative_score=0: в CLS они не вошли.
Это не основание утверждать, что геометрия не менялась. Возможные font swap и уточнение rail layout
требуют отдельного сопоставления; точная причина и заметность не подтверждены.
Не суммировать эти scores как официальный CLS записи.

Вывод: direct Projects работает, parallel API и несколько видимых screenshot ожидаемы;
длительных main-thread блокировок нет. Изменение геометрии сохраняем как наблюдение для проверки
при медленной сети/мобильной компоновке, без фикса по одному быстрому запуску.
Следующий сценарий — direct reload того же /projects/unicon при 390 × 844 DPR2, No throttling,
Disable cache, без rail/tab interactions. Затем отдельная запись rail/tab interactions и route entry/exit.

### Projects mobile direct: Trace-mobileProjects.json.gz

Дата 2026-10-29 01:53:29 UTC, /projects/unicon, итоговый viewport 390 × 844 DPR2,
No throttling CPU/network и Disable cache по инструкции.

- DOMContentLoaded 56.49 ms, Load 56.57 ms, First Paint 73.31 ms, FCP 98.31 ms.
- LCP heading ~98 ms, затем первый screenshot (eager) 223.31 ms.
- Max main RunTask 20.41 ms; >50 ms нет. HTTP ответы 200, ResourceFinish.didFail нет, POST нет.
- Detail/list запрашиваются параллельно ~83–84 ms, оба отвечают ~136 ms.
- Загружены три tab logo и только первый screenshot; соседние screenshot отложены.
- Sum ResourceFinish.encodedDataLength 701,241 B против 907,815 B в desktop.
  Это разные видимые площади/наборы изображений, не доказательство ускорения CPU на mobile.
- Screenshots: ~98 ms loading feedback, ~198 ms browser с пока пустым screenshot panel,
  ~297 ms первый screenshot виден.
- Один LayoutShift ~146.69 ms: surface поднимается на 80 физических px (40 CSS px),
  score 0.03729, had_recent_input=true, cumulative_score=0. В CLS не вошёл.
  Аналогичное смещение surface найдено на desktop: наблюдение повторилось в двух компоновках.

### PERF-05: изменение геометрии Projects surface при initial load

Статус: воспроизводимое наблюдение в desktop/mobile trace; причина/заметность требуют проверки, исправлений нет.
Факт: surface меняет вертикальное положение примерно на 40 CSS px после появления данных;
официальный CLS этих записей не увеличен из-за had_recent_input.
Проверить момент готовности вкладок, обновление layout и границу loading → browser,
затем отдельно проверить прямой вход без недавнего ввода и медленную сеть.
Не объявлять loading-state transition редизайном и не менять утверждённую композицию.
Цель возможного исправления — стабильная финальная геометрия во время загрузки без нарушения
полной viewport высоты, tabs, native rail и shared route transition.

Следующий сценарий Projects — обычная Record с включённым кешем: rail до metadata,
переключение на другой project tab, затем возврат на исходный Unicon;
проверить loading новых screenshot, mounted-session detail cache и сброс rail.
Выполнить отдельно desktop/mobile с фактически зафиксированными размерами и без reload внутри записи.

### Projects mobile rail/tabs: Trace-mobileProjectsInteraction.json.gz

Дата 2026-10-29 01:56:32 UTC; 390 × 844 DPR2, кеш включён, обычная Record,
около 17.34 s. Сценарий Unicon rail → SuperSauced → DomSot → Unicon с дальнейшим листанием.

- Max main RunTask 8.65 ms, задач >50 ms нет; отдельные click EventTiming около 19–28 ms.
- Document navigationStart нет, основной JS/CSS не перезагружается; global route motion не найден.
- Оставшиеся Unicon screenshots запрашиваются при продвижении rail (~1.38/1.93 s), fromCache=true.
- SuperSauced detail запрашивается один раз ~5.56 s, DomSot один раз ~9.17 s, оба HTTP 200.
- При возврате Unicon ~11.94 s нового detail GET нет: mounted-session cache работает.
  Screenshot URL могут повторно проходить запрос с fromCache=true при повторном монтировании img.
- В новых проектах screenshot requests распределены по времени листания, без немедленной загрузки всего showcase.
- Все полученные HTTP responses 200, ResourceFinish.didFail нет; POST нет.
- LayoutShift events относятся к project-tab width/active-state changes после кликов;
  had_recent_input=true, cumulative_score=0. Это интерактивная геометрия табов,
  не то же наблюдение, что PERF-05 при initial load; отдельную ошибку по этому факту не заводим.
- DroppedFrame markers: 14 с hasPartialUpdate=true, 1 false; нет оснований объявлять весь rail проблемным
  или выводить средний FPS только из этих маркеров.
- Screenshots показывают продвижение Unicon до metadata. Лимит 450 кадров достигнут ~5.57 s,
  последующие tabs и возврат визуально не захвачены. Повторное использование detail подтверждено сетью,
  сброс rail к первому screenshot не считаем полностью проверенным визуально по этой записи.

Desktop interaction trace ещё не предоставлен. Следующий шаг — та же последовательность в desktop
с обычной Record и кешем; пользовательское наблюдение сброса rail дополнит ограниченные screenshots.

### Projects desktop rail/tabs: Trace-desktopProjectsInteractions.json.gz

Дата 2026-10-29 01:59:21 UTC; 1440 × 1080 DPR2, кеш включён, около 8.84 s.
Unicon → SuperSauced → DomSot → Unicon, обычная Record.

- Max main RunTask 16.42 ms, >50 ms нет; click EventTiming около 21–30 ms.
- Нет document reload и повторных основных JS/CSS; global route spatial animations не запускаются.
- Первое посещение SuperSauced/DomSot вызывает detail GET с cached response и последующим сетевым обновлением,
  все HTTP 200. Это отличается от session Map cache: при возврате Unicon detail GET вообще нет.
- На desktop screenshot несколько панелей видны вместе; media берутся из HTTP-кеша.
- 40 LayoutShift events после кликов, все had_recent_input=true/cumulative_score=0;
  сопровождают width/opacity transitions вкладок, не заводим отдельный дефект по самому счётчику.
- Четыре DroppedFrame markers hasPartialUpdate=false; long tasks нет, причина/видимость frame misses не локализованы.
- ResourceFinish.didFail не найдено; POST нет.
- Screenshots до ~4.82 s показывают исходный Unicon и SuperSauced; возврат Unicon ~6.44 s
  вне screenshot capture. Cache подтверждён запросами, окончательный reset rail требует наблюдения пользователя.

Итог базовых Projects-сценариев: direct load и rail/tabs проверены на desktop/mobile в Chrome без throttling;
кеш деталей, lazy media и отсутствие reload подтверждены. PERF-05 initial geometry остаётся кандидатом.
Route entrance/exit, index redirect, Back/Forward, errors, keyboard/reduced-motion и другие браузеры ещё не проверены.
Следующий performance baseline — Services: direct index и media-rich detail, затем открытие/закрытие detail.

### Services media/open: Trace-desktopProductDesign.json.gz

Дата 2026-10-29 02:05:18 UTC, начинается с /services, viewport 1440 × 1080 DPR2,
окно ~9.06 s; CPU/network No throttling и Disable cache по инструкции.

- Detail product-ui-ux запрашивается ~1.37 s, HTTP 200 ~1.44 s; document reload нет.
- Preview images, отложенные ServiceRiveAsset JS/CSS, затем WASM и три .riv реально загружены.
  JS chunk ~76 kB transfer gzip, три .riv суммарно около 11.7 kB.
- Rive runtime WASM ответ ~1.77 s, завершение ~1.79 s; 2,128,716 B body, Content-Encoding отсутствует.
  Это local preview delivery; нельзя переносить отсутствие сжатия на будущий Render без проверки.
- MP4-URL подключается после появления detail, response 206 Partial Content с MIME video/webm;
  206 нормален для video range requests, URL extension не гарантирует фактический формат ответа CDN.
  Воспроизведение/форматы на Safari ещё не проверены. ResourceFinish видео в окне не найдено,
  это не доказывает ошибку или окончание playback.
- Широкая компоновка показывает video/image/Rive group в одном viewport: ранний runtime load
  здесь согласуется с visibility-based loading, не основание объявлять lazy loading сломанной.
- Кадры показывают видео и замену previews на Rive canvas; runtime loaded и рисунок есть,
  но hover ViewModel, pause вне rail/hidden, replay и cleanup нельзя полностью подтвердить этими кадрами.
- Max main RunTask 23.63 ms, причём крупнейшая задача в начале — CpuProfiler::StartProfiling;
  >50 ms нет. Инициализация Rive microtasks около 14.3 ms.
- LayoutShift events нет; DroppedFrame markers 3 partial/1 nonpartial. Ошибок ResourceFinish нет.
- Screenshots заканчиваются ~4.83 s, запись содержит поздние клики до ~6.99 s.
  Финальный индекс/закрытие визуально не захвачены; не помечаем закрытие полностью проверенным.
- Все HTTP responses 200, кроме нормального video 206; POST нет.

Наблюдение пользователя после Services trace: с DevTools анимации/hover Rive не проявлялись,
без DevTools всё выглядит хорошо. Это различие окружений, не подтверждённый дефект Rive.
В trace metadata Responsive; ширина 1440 сама по себе не доказывает mouse/fine pointer.
В коде ServiceRiveShowcaseStack принимает hover только при pointerType='mouse', CSS отключает
pointer-events у preview/canvas при hover:none или pointer:coarse, чтобы сохранить rail gestures.
Возможная причина — touch-emulation Device Toolbar; требуется проверка с отключённой Device Toolbar
при открытом DevTools. Reduced motion/visibility также проверяются отдельно;
само наличие DevTools не должно считаться доказанной причиной остановки runtime.
Пользовательский результат без DevTools сохраняем как положительное визуальное наблюдение,
не заменяя им ещё не выполненную проверку hover/pause/replay/cleanup.

### Обновлённый desktop Services trace без Device Toolbar

Пользователь заменил `Trace-desktopProductDesign.json.gz`, дата 2026-10-29 02:35:34 UTC,
около 16.40 s. emulatedDeviceTitle отсутствует (ранее Responsive), видны desktop composition и mouse events.
Точный viewport основного документа в новом trace отдельно не определён:
событие 84 × 84 принадлежит вспомогательному контексту и не принимается за размер страницы.

- Detail HTTP200 ~1.87 s; начало reveal ~2.11 s. Rive JS/WASM и 3 .riv HTTP200,
  видна замена previews на runtime surfaces; mousemove/pointerover присутствуют.
  События мыши не доказывают запись hovered ViewModel; точную реакцию подтверждает пользователь.
- Max main task 32.01 ms, >50 ms нет. DroppedFrame markers: 8 partial, 1 nonpartial.
- Opening и closing detail реально представлены событиями: входные masks ~2.11 s,
  обратные masks ~13.29 s и collapse layer ~13.57 s. Document reload нет.
- Video play/playing ~2.18/2.22 s, pause ~4.09 s, play/playing ~5.83 s, pause ~13.45 s.
  Это согласуется с паузой вне видимой области и продолжением при возвращении;
  ended/replay в trace нет, поэтому одно завершение/replay ещё не проверены.
- Media request отменён около 13.77 s при закрытии detail: ResourceFinish.didFail=true
  относится к видео. По времени соответствует cleanup, не доказательство сетевого дефекта.
- 34 LayoutShift events связаны с SPAN action/ForwardBack; все had_recent_input=true,
  максимальное cumulative_score около 0.00155. Проверку не интерпретируем как полное отсутствие движения.
- WASM снова 2.13 MB без Content-Encoding: PERF-06 сохраняется как delivery/deployment finding.
- Screenshots до ~4.83 s; поздний hover и финальный index не захвачены визуально.

Вывод: новая запись позволяет подтвердить desktop opening/closing events и mouse environment,
а не только mobile-like pointer контекст предыдущей. Обнаруженных длительных main tasks нет.
Крупные проблемы Rive по этой записи не подтверждены; hover визуально/ended/replay и реальные устройства
остаются отдельными функциональными пунктами. Дополнительный trace без симптома сейчас не требуется.

### PERF-06: доставка Rive WASM и проверка сжатия на хостинге

Статус: подтверждён несжатый WASM в local preview, кандидат проверки deployment, без изменений кода.
Самые крупные новые байты detail — runtime ~2.13 MB, а не .riv assets (~12 kB суммарно).
Цель: проверить фактические Content-Encoding/Cache-Control и transfer при тестовом Render,
затем cold/warm запуск видимой Rive group на ограниченной сети.
Не подключать runtime заранее на Home и не менять утверждённую непрозрачную подложку Services.
Не добавлять ручные precompression/hosting обходы без подтверждения поведения выбранного хостинга.

### Уточнение объёма дальнейшего аудита

По обсуждению с пользователем перестаём запрашивать полный набор cold/warm/stress trace для каждой страницы.
Подробный Home baseline был обучающим; далее обычные сценарии проверяются визуально, Network/Console,
а Performance trace используется для тяжёлых медиа, наблюдаемой задержки/рывков и сравнения исправлений.
Services index initial trace отдельно пропущен осознанно. Это не означает пропуск функциональной проверки.
Следующий шаг — краткий функциональный проход маршрутов/direct URL/BackForward и оставшихся поверхностей,
с точечными записями при находках, затем keyboard/focus/reduced motion и согласованный этап исправлений.

### Функциональный проход: About / References / Contact

Пользователь выполнил предложенный проход через primary navigation About → References → Contact,
обычный reload на каждой странице, затем browser Back/Forward. Сообщён результат: всё нормально,
включая Back/Forward; пустые страницы, зависшие переходы или неожиданный dialog не сообщены.
Это ручное визуальное подтверждение в текущем локальном Chrome, не проверка всех браузеров/устройств.
Формы не отправлялись. Полная keyboard/accessibility проверка, ошибки/Retry и другие nested-history
сценарии из этого прохода не следуют. Предыдущий вопрос о Rive hover этим ответом не закрываем.

Следующий функциональный набор — прямые /projects и /services, неизвестный URL и неизвестные
project/service slug. Затем локальная валидация пустых форм без успешной отправки,
keyboard/focus и reduced motion. ENV-01 остаётся открытым для origin-защищённых mutations.

### Прямые index/unknown URL: пользовательский проход

Пользователь сообщил, что предложенные /projects, /services, неизвестные project/service slug
и неизвестный общий URL выдают содержимое/ошибку; зависший пустой экран не сообщён.
Точная семантика redirect и HTTP status frontend HTML этим описанием не подтверждена.
404 у неизвестного API slug ожидаем; не смешивать с frontend SPA fallback и видом error state.

### UI-01: цельность browser-shell неизвестного проекта

Статус: пользователь сообщил визуальную проблему на неизвестном project slug, требует актуального screenshot.
Описание: browser composition выглядит нецельной. Приложенный по словам пользователя image.png
при чтении с диска всё ещё показывает старый DevTools Network dependency tree; внешний вид 404 не увиден.
По коду unknown slug сохраняет ProjectBrowser с activeSlug/theme=null и всеми published tabs;
ProjectsPageFeedback внутри viewport рисует собственные border/background/radius поверх shell.
Возможные источники визуальной проблемы — отдельная вложенная карточка feedback и нейтральная theme;
это гипотезы, а не подтверждённая причина без screenshot.
Цель будущего исправления: сохранить узнаваемую цельную browser composition, ясное сообщение unknown slug
и возможность открыть существующий project tab без ложного выбора проекта и изменения URL.
Дизайн успешных Projects и API 404 не менять. Исправления пока не внесены.

### Contact: пустая форма и базовый keyboard-проход

Пользователь выполнил предложенную проверку /contact: нажатие отправки с пустыми полями,
читаемость ошибок/доступность прокрутки и проход Tab по форме. Сообщил, что всё нормально.
Это ручное качественное подтверждение; точный focus target и отсутствие POST не зафиксированы
отдельным Network artifact, поэтому не считаем их независимо инструментально проверенными.
Реальная отправка не запрашивалась и не согласовывалась. Screen reader, контраст,
масштабирование, mobile form и серверная обработка submission ещё требуют проверки.

Следующий шаг: пустая inline References form и восстановление после ошибок без заполнения реальными
данными и без отправки. При pending/owned блокировке это состояние не сбрасывать удалением данных.

### References: пустая форма и Enter в inline testimonial

Пользователь сообщил «работает» после сценария /references: пустая отправка, читаемость ошибок,
Tab/Shift+Tab и переносы Enter в inline testimonial. Замечаний и блокировки ownership не сообщил.
Это ручное подтверждение текущего окружения, не инструментальный proof всех aria-связей,
network absence или успешного server submission. Реальную отправку не выполняем.
Следующий шаг — Home Contact drawer и Reference details modal: начальный фокус, Tab trap,
Escape и возврат фокуса; без заполнения всех полей и отправки.

### Home dialogs: ручной keyboard/focus проход

Пользователь сообщил «работает» после предложенной проверки Home Contact drawer и Reference details modal:
открытие клавиатурой, начальный фокус внутри, Tab/Shift+Tab без ухода на фон, Escape,
возврат фокуса к инициатору/полю отзыва. Замечаний не сообщил.
Сценарий не включал заполнение всех полей и реальную отправку; screen reader и submitting-state
keyboard semantics отдельно не проверены. Это ручное подтверждение, без browser automation.
Следующий accessibility шаг — browser zoom 200% на Contact/References/About и доступность
элементов в viewport-locked layouts, включая внутреннюю прокрутку.

### PERF-01: отложенный запуск Turnstile в Home Contact

Статус: точечное изменение реализовано локально; Network/timing и browser lifecycle проверки ожидаются.

Наблюдение: закрытый ContactDrawer монтирует ContactForm и TurnstileWidget.
При initial load Home запускаются запросы Cloudflare даже без открытия формы.
В предоставленном HAR они передали суммарно около 226 kB.

Предлагаемое изменение: запускать widget при открытии контактной формы,
проверив жизненный цикл при закрытии/повторном открытии. На dedicated Contact и References
нужно отдельно оценивать момент готовности формы; не переносить изменение механически на все поверхности.

Цель: убрать ранние расходы для посетителей Home, которые не открывают форму.
Зафиксированный объём не доказывает задержку Hero: стоимость CPU и влияние на FCP/LCP ещё не измерены.
Компромисс: загрузка и проверка начнутся позже; при быстрой отправке возможно ожидание.

Перед реализацией: сохранить Performance-запись initial load, затем измерить готовность widget
после открытия формы при обычной и ограниченной сети, без отправки сообщения.

Критерии проверки после реализации:

- На свежей загрузке Home до открытия форм нет запросов Turnstile.
- Открытие Contact запускает проверку; загрузка, ошибка и истечение токена обработаны.
- Закрытие/повторное открытие не оставляет лишних widget и устаревших callbacks.
- Отправка по-прежнему требует действующего токена и backend Siteverify; защиту не отключаем.
- References и dedicated Contact сохраняют корректный жизненный цикл.
- Повторены исходный замер Home и замер готовности формы в тех же условиях.
- Сквозная успешная отправка выполняется только после отдельного согласования тестового окружения.

Cloudflare документирует отложенное выполнение, включая условную проверку и последний шаг формы:
https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/#execution-modes
Токены одноразовые и действуют пять минут:
https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
Точный эффект момента запуска на внутренние сигналы классификации не раскрыт;
гарантировать одинаковую классификацию раннего и позднего запуска нельзя.

### PERF-02: отложенная загрузка пейзажа Home Contact

Статус: кандидат на улучшение; реализации пока нет.

Наблюдение: декоративный пейзаж последней секции Home — обычный img без `loading="lazy"`.
В HAR запрос начинается примерно одновременно с портретом Hero, имеет Low priority
и передаёт 141,080 B, хотя секция Contact находится далеко ниже первого экрана.

Предлагаемое изменение: проверить использование нативного `loading="lazy"`, сохранив
размеры изображения, композицию и существующую анимацию раскрытия Contact.
Цель: отложить передачу ресурса до приближения посетителя к секции.
Задержка Hero этим запросом пока не доказана.

Критерии проверки:

- Сравнить момент запроса и начальный сетевой объём до/после в одинаковых условиях.
- Проверить обычную и быструю прокрутку к Contact, включая ограниченную сеть.
- Пейзаж успевает появиться к своему раскрытию; нет новых сдвигов layout или нарушения анимации.
- Проверить desktop/mobile, прямую загрузку с якорем Contact и восстановление scroll.
- Повторить измерения затронутых сценариев; при заметном запаздывании пересмотреть момент загрузки.

### Как выполняется этап 5

1. Для каждого кандидата записать наблюдение, воспроизведение, влияние, предлагаемое изменение и критерии проверки.
2. После исходных проверок выбрать подтверждённые проблемы по влиянию: блокирующие сценарии и доступность, затем производительность и мелкие дефекты.
3. Обсудить выводы с пользователем до перехода от измерений к исправлениям.
4. Вносить небольшие связанные изменения без редизайна и новых функций.
5. Выполнять подходящие проверки, typecheck/lint и повторять затронутые сценарии в исходных условиях.
6. Записывать результат до/после, оставшиеся ограничения и статус кандидата.

Остальные наблюдения (шрифт, bundle, две записи portrait) остаются кандидатами для изучения,
а не утверждённым списком обязательных оптимизаций.
