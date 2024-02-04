Solid-Ledger client-to-client specification
===========================================

* A Ledger is an RDF resource,
  declaring itself as an instance of sl:Ledger,
  referenced in the type index (via solid:instance).

  It points to one current book, and zero to many archived books.

  It contains two-to-many accounts,
  one of them optionally defined as the default account.

  All accounts are expected to be declared in the same RDF resource.
  

* A Book is an RDF resource,
  declaring itself as an instance of sl:Book,
  and containing zero to many instances of sl:Transactions.

  A transaction contains two to many entries.
  The sum of the amounts of all entries in a transacrion must be zero.
  The accound of each entry of a transaction must be one of the account
  of the ledger in which the transaction is located (via its book).

* A book is meant to belong to exactly one ledger.
  It points back to its ledge with the sl:inLedger property.
