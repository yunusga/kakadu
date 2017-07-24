# kakadu

Модуль для локальных-тестовых изменений удалённого сайта (отладка скриптов, адаптация и т.п.)

## ВНИМАНИЕ!
kakadu переехал в организацию [tazau](https://github.com/tazau)
необходимо изменить ссылки на репозиторий
```
git remote set-url origin https://github.com/tazau/kakadu.git
```

### Содержание
- [Установка](#Установка)
- [Начало работы](#Начало-работы)
- [Параметры CLI](#Параметры-cli)

## Установка
* ```git clone https://github.com/yunusga/kakadu.git && cd kakadu && npm i . -g && npm link```
- возможны ошибки при установке ```gulp-sass``` на Windows OS, скорее всего потребуется установить ```python 2```
- Да, в случае отстутствия установленного в системе python, gulp-sass не устанавливается. Не забудьте во время установки отметить пункт установки переменной окружения или добавить позже, вручную

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
    -h, --help                  справка по использованию

```

### -a, --auth user@password
Устанавливает логин@пароль для включения авторизации для прокси (по умолчанию kakadu@случайный-пароль), в случае, если указать только имя пользователя, то, пароль сгенерируется автоматически.

![Авторизация с параметрами по умолчанию](https://1.downloader.disk.yandex.ru/disk/1ce5bf3021add193b99ca15a4673e93f34adaa3ca51b036b531437e4ae499c2f/5971d6ba/_B0aXmp4RJTYYcc2mgnKlhvOzGyFr0KHGWEEtj1g8US-Bl9MJ8jDnVYmreOu0sNin2A8FUuQRBqxdqUHdjNSyQ%3D%3D?uid=0&filename=2017-07-21_11-22-15.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&fsize=1802&hid=bbd59749690ab2a33589ab135e681db4&media_type=image&tknv=v2&etag=72f0d89eb995b785be0fcc1a49d32779)
- `--nano` - включение cssnano при сборке стилей

### --proxy [url] -p, --port <n> -t, --tech [tech]
Ипользуются вместе, в момент инициализации проекта, для установки значений в конфиге.
```
kakadu --proxy https://example.com -p 9000 -t styl
```
В случае если не прописать параметры в момент инициализации, придётся поправить всё воручную после создания проекта.

### --proxy [url]
URL проксируемого сайта проекта

### -p, --port <n>
Установка порта для прокси. Имеет приоритет над установленным портом в конфиге.

### -t, --tech [tech]
CSS пре-процессор styl, scss, less (по умолчанию styl) для стилей проекта

###-n, --nano
Включает оптимизации и обжатие плагина cssnano
