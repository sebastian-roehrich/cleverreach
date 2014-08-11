cleverreach
===========

Cleverreach-Plugin for Shopware 4.x

1. Was ist der Unterschied zwischen Bestellkunden und Shopkunden?
Mit Bestellkunden sind diejenigen Kunden gemeint, die die Newsletter-Option unmarkiert ('unchecked') gelassen haben - sozusagen ‚reine‘ Bestell-Kunden. 
Mit Shopkunden wiederum sind diejenigen Kunden gemeint, die die Newsletter-Checkbox aktiviert haben. Diese Kunden können beispielsweise im Newsletter-Mailing mit einer persönlichen Anrede angesprochen werden, da diese Daten vorliegen.


2. Was sind die häufigsten Gründe, dass meine Kundendaten nicht übertragen werden?
Die häufigste Ursache für eine fehlerhafte / lückenhafte Übertragung von Kundendaten zwischen CleverReach und Shopware ist die fehlende Definition von Gruppen und damit der Zuordnung von Shopware-Daten zu CleverReach und umgekehrt. 
Bitte definieren Sie Kunden-Gruppen unter CleverReach und ordnen Sie diese den Shopware-Gruppen unter der Rubrik " Shop-Kundengruppen-Listen-Zuordnung" zu und führen Sie den "Erst-Export" erneut durch.


3. Wie werden direkte Newsletter-Anmeldungen übertragen?
Kunden, die sich für die direkte Newsletter-Anmeldung in Ihrem Shop entschieden haben, befinden sich in der Gruppe Interessenten.
Mit Interessenten werden eben diese "non-customers" (Nicht-Einkaufs-Kunden) bezeichnet, die den Newsletter über das Newsletter-Kontaktformular im Frontend abonniert haben: In der Anwendung, bedeutet das, dass Sie somit das Mailing an Interessenten (Newsletter/oder andere Mailings) mit einer anonymisierten Anrede verfassen können, da die Kunden dieser Gruppe i. d. R. lediglich die Angabe zu Ihrer Email-Adresse getätigt haben. Demgegenüber steht die Gruppe der Shopkunden, die die Newsletter-Checkbox über Ihr Kundenkonto aktiviert haben und von denen entsprechend (mehr) persönliche Daten vorliegen.
