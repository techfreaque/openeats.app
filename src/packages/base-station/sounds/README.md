# Sound Files for Cross-Print-Server

This directory contains sound files used by the print server for notifications.

## Required Sound Files

The following sound files are used by the print server:

- `new-order.mp3` - Played when a new print job is received
- `print-success.mp3` - Played when a print job completes successfully
- `print-error.mp3` - Played when a print job fails

## Creating Sound Files

You can create your own sound files or download free sound effects from websites like:

- [Freesound](https://freesound.org/)
- [SoundBible](https://soundbible.com/)
- [ZapSplat](https://www.zapsplat.com/)

## Format

The sound files should be in MP3 format for best compatibility. WAV files are also supported.

## Volume

The volume of the sound files can be adjusted in the configuration file (`config/default.json`) by changing the `notifications.volume` setting (0-100).

## Disabling Sounds

If you don't want to use sound notifications, you can disable them by setting `notifications.enabled` to `false` in the configuration file.
