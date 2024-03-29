# kakadu

Модуль для локальных-тестовых изменений удалённого сайта (отладка скриптов, адаптация и т.п.)

## Содержание
- [Установка](#Установка)
- [Обновление](#Обновление)
- [Использование CLI](#Использование-cli)
- [Заготовка проекта](#Заготовка-проекта)

## Установка
- `git clone https://github.com/tazau/kakadu.git && cd kakadu && npm i . -g && npm link`
- возможны ошибки при установке `gulp-sass` на Windows OS, скорее всего потребуется установить `python 2`, в случае отстутствия установленного в системе python, gulp-sass не устанавливается. Не забудьте во время установки отметить пункт установки переменной окружения или добавить позже, вручную

## Обновление
При обновлении зависимостей `kakadu`, по причине плохого интернета или глюков в работе `npm` под **Windows**, может возникнуть ситуация что каких-то модулей вдруг станет нехватать.

###Костыль
После получения изменений из репозитория, необходимо удалить папку `node_modules` и выполнить `npm cache clean && npm i` (т.е. установить завосимости заново)

## Использование CLI

```javascript
$ kakadu --help

  Usage: kakadu [options]


  Options:

    -V, --version               показать версию модуля
    -a, --auth [user@password]  установка логина и пароля для авторизации
    --proxy [url]               URL для прокси
    -p, --port <n>              порт для прокси
    -t, --tech [tech]           CSS пре-процессор styl, scss, less (по умолчанию styl)
    -n, --nano                  включить cssnano
    -c, --clipboard             копировать URL прокси-сервера в буфер обмена
    -o, --open                  открывать браузер при старте
    -h, --help                  справка по использованию

```

### -a, --auth user@password
Устанавливает логин@пароль для включения авторизации для прокси (по умолчанию kakadu@случайный-пароль), в случае, если указать только имя пользователя, то, пароль сгенерируется автоматически.

### --proxy [url] -p, --port <n> -t, --tech [tech]
Ипользуются вместе, в момент инициализации проекта, для установки значений в конфиге.
```
kakadu --proxy https://example.com -p 9000 -t styl
```
В случае если не прописать параметры в момент инициализации, придётся поправить всё вручную после создания проекта.

### --proxy [url]
URL проксируемого сайта проекта

### -p, --port <n>
Установка порта для прокси. Имеет приоритет над установленным портом в конфиге (по умолчанию 8300).

### -t, --tech [tech]
CSS пре-процессор styl, scss, less (по умолчанию styl) для стилей проекта

### -n, --nano
Включает оптимизации и обжатие плагина cssnano

### -c, --clipboard
Открывает браузер при старте модуля,приоритет над опцией `open` для натстроек `browsersync`
Копировать URL прокси-сервера в буфер обмена

### -o, --open
Открывает браузер при старте модуля,приоритет над опцией `open` для натстроек `browsersync`

## Заготовка проекта

```bash
kakadu_project
├─ source
│   └─ components
|   |   ├─ template.{html,beml,php,etc}
|   |   ├─ template.{styl,less,scss}
|   |   └─ template.js
│   ├─ iconizer
│   │   ├─ icons
│   │   │   ├─ close.svg
│   │   │   └─ menu.svg
│   │   └─ sprite.svg
│   ├─ scripts
|   |   └─ app.js
│   └─ styles
|       └─ app.{styl,less,scss}
│
└─ config.js
```
