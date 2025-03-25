# open-delivery

Door Dash clone, but open source and with "0" fees.

Instead of being a man in the middle everything works peer to peer, which simplifies a lot of things.

## Preview / Demo Server

### Backend Server
https://eats-backend.a42.ch

### Frontend Server
https://eats.a42.ch

### Credentials

- Admin: admin@example.com / password
- Customer: customer@example.com / password
- Restaurant: restaurant@example.com / password
- Driver: driver@example.com / password



## Project Structure

## Backend

API's for everything and a admin dashboard for desktop only stuff (hopefully nothing)

## App

- React native app for Web, Windows, Android, iOS, Mac, etc.
- App will handle: 
    - Drivers
        - Make sure they get payed well
        - Figure out a way to handle shift work and having always capacity
            - Some math algo magic should do it
                - Auto trigger hiring blocks/unblocks
                - Keep constant shift schedules with a backup in case
    - Restaurants
        - handles notifications and printing on order
        - Point of Sale for Offline transactions
            - Will follow after launch
            - basically the app but with bigger buttons
            - Handle printer and other POS accessories
    - Users
        - Lieferando Doordash clone
        - Easy as we wont handle payment for now

## How we make money?

### Delivery Network

- Small fees on the delivery
- You'll still be able to deliver yourself for free as a restaurant
- figure out a legal construct so we can easily allow "everyone" to drive and make money

### Printing menus and other marketing materials

This will follow after launch:

- Small commission if you decide to order through us (we'll beat regular sources by scaling) 


### Online Payments

- Free offline payment (cash or card)

- Online payment will have a small fee at least until we find a peer to peer way
    - This will follow after launch

### Websites

You fill a form with all your restaurant details, menu, everything.
Then our system prompt takes it and does https://v0.dev magic
+ The user can then do v0.dev magic until they are satisfied or frustrated enough to hire us.

There will be pages that can just be themed and unlimited others that can be generated.


### Advertizement

This will follow after launch


There will be spots where you can feature your appearance for money, but this will be kept to a minimum and we'll rely mostly on ratings and genre

### POS and ERP

This will follow after launch

Make a nice POS and connect to an open source ERP
Sell this product for cheap and make sure it fits most cases out of the box.
And setup is easy, e.g. scan products from image of a menu 


## Integrating a new Partner

### One smaller town after the other

1. A person will personally talk to each restaurant owner in the city and get as much signatures as possible. For both as a restaurant and as a driver.
2. Then another round he will go from store to store and make them do the setup steps in the app, if they haven't already. Or do it yourself.


Should be easy because:
- 0 Fees compared to +10% with competition
- Only Fees on:
    Online Payment (offline cash/card is free)
    Delivery Network (for free if you deliver)
- Free website + app that will do it for 80%
- Order by app on the table (for free)
    + upsell Mc Donalds Type Screens in all sizes
- Partners can bring their own domain or use a subdomain for free
- Optional:
    - Premium Website Customization via AI e.g. integrate https://v0.dev
    - Premium ERP and POS System replacement for all other 

