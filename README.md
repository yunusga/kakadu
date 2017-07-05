# kakadu <sup>[2.3.6]</sup>

Модуль для локальных-тестовых изменений удалённого сайта (отладка скриптов, адаптация и т.п.)

### Содержание
- [Установка](#Установка)
- [Начало работы](#Начало-работы)
- [Параметры запуска](#Параметры-запуска)

## Установка
* ```git clone https://github.com/yunusga/kakadu.git && cd kakadu && npm i . -g && npm link```
- возможны ошибки при установке ```gulp-sass``` на Windows OS, скорее всего потребуется установить ```python 2```
- Да, в случае отстутствия установленного в системе python, gulp-sass не устанавливается. Не забудьте во время установки отметить пункт установки переменной окружения или добавить позже, вручную

## Начало работы

- создаем папку (желательно одноименную с сайтом)
- переходим в нее
- открываем в терминале или командной строке (shift + ПКМ для Windows)
- вводим ```kakadu```
- конфигурируем скопированную заготовку проекта
- вводим ```kakadu``` в терминале

После запуска целевой сайт запустится через локальный прокси-сервер и в его ```HTML``` внедряются стили ```app.css``` которые компилируются из файла, выбранного CSS пре-процессора на старте проекта

CSS пре-процессор можно всегда сменить, установив значение конфига (**config.js**) ```tech``` в ```styl, less или scss```, дополнительно придется создать файл с расширением выбранного CSS пре-процессора ```app.styl,less или scss```

## Параметры запуска
- ```kakadu``` стандартный запуск (первый для инициализации, все последующие для работы)
- ```kakadu -a -u user -p pass``` запускает прокси-сервер с авторизацией (`user` логин, `pass` пароль)
