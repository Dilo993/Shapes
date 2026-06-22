# Sprawdzian Rysowania Znaków

Prosta aplikacja webowa, która sprawdza, jak dokładnie użytkownik potrafi odtworzyć dany znak (kształt) w określonym czasie. Aplikacja oferuje dwa tryby rozgrywki oraz automatycznie oblicza procentową trafność rysunku za pomocą algorytmu porównywania pikseli z tolerancją na drobne błędy.

## Funkcje aplikacji

* **Dwa tryby gry:**
    * *Z podglądem:* Pod spodem wyświetla się półprzezroczysty wzór, który ułatwia odrysowywanie.
    * *Z pamięci:* Wzór znika po kliknięciu START – musisz narysować kształt z głowy.
* **Limit czasu:** Gracz ma dokładnie 6 sekund na ukończenie rysunku. Po tym czasie możliwość rysowania jest blokowana, a wynik sprawdza się automatycznie.
* **Inteligentne ocenianie:** Algorytm nie wymaga idealnego pokrycia pikseli 1:1. Posiada wbudowany margines błędu (tolerancję na przesunięcia) oraz obniża ocenę za rysowanie poza liniami wzoru.
* **Łatwa personalizacja:** Baza znaków jest w pełni oddzielona od logiki aplikacji, co pozwala na szybkie dodawanie nowych kształtów.
* **Responsywność:** Obsługa rysowania zarówno myszką (PC), jak i dotykiem (smartfony/tablety).

## Struktura projektowa

Projekt został podzielony na moduły zgodnie z zasadą pojedynczej odpowiedzialności:

* `index.html` – Struktura widoku gry.
* `style.css` – Oprawa wizualna (ciemny motyw z elementami w kolorze wheat).
* `shape.js` – Baza danych zawierająca listę znaków i kształtów.
* `drawing.js` – Moduł obsługujący rysowanie na elemencie canvas.
* `accuracy.js` – Silnik matematyczny obliczający celność rysunku.
* `script.js` – Główny kontroler łączący wszystkie moduły i zarządzający czasem gry.

## Jak łatwo dodać własne znaki?

Wszystkie kształty znajdują się w pliku shape.js. Aby dodać swój własny znak, otwórz ten plik i dopisz nowy obiekt do tablicy ZNAKI według poniższego wzoru:

```javascript
export const ZNAKI = [
    { 
        name: "Nazwa Twojego Znaku", 
        url: "./img/twoj_znak.png" 
    }
];