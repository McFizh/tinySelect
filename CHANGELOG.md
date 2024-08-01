## 2.0.1 (1.8.2024)

- Updated (dev)dependencies
- Dropped jquery 3.5 from tests and replaced it with jquery 3.7
- Updated pipeline to use latest node version / actions

## 2.0.0 (30.11.2022)

Code cleanup:

- Dropped support for jquery 1
- All var definitions have been change to either const or let
- Added qunit test for latest jquery 3.6 and previous 3.5
- Updated grunt & qunit packages
- Replaced jshint with eslint
- Migrated from travis to github actions
- Updated node version used in automated testing from 8 to 14
- Added http-server page so that demo can be easily started
- Moved source files to src directory

## 1.0.6 (16.7.2018)

Code cleanup:

- Updated dev package versions
- Recompiled with newer js uglify (this in turn reduced filesize by 7 bytes.. Yay)
- Replaces tabs from source

## 1.0.5 (9.7.2016)

Bug fixes:

- Text filtering can now be set as case sensitive or insensitive
- tinySelect main div is now given id, if original select has id. The new id is original + \_ts
- Updated qunit from 1.x to 2.x and added some basic tests against jquery 1.x , 2.x and 3.x
