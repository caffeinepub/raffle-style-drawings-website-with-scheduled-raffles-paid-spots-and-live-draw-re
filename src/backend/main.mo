import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Random "mo:core/Random";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  type RaffleStatus = { #upcoming; #open; #closed; #drawn };

  public type Raffle = {
    id : Nat;
    title : Text;
    description : Text;
    spotPriceCents : Nat;
    totalSpots : Nat;
    prizeAmountCents : Nat;
    drawTimestamp : Time.Time;
    videoUrl : ?Text;
    status : RaffleStatus;
    winner : ?Text;
    createdTime : Time.Time;
    lastUpdated : Time.Time;
    drawRecordId : ?Text;
  };

  public type Entry = {
    id : Nat;
    raffleId : Nat;
    buyer : Text;
    quantity : Nat;
    isPaid : Bool;
    purchaseTime : Time.Time;
  };

  public type RaffleAdminConfig = {
    title : Text;
    description : Text;
    spotPriceCents : Nat;
    totalSpots : Nat;
    prizeAmountCents : Nat;
    drawTimestamp : Time.Time;
    videoUrl : ?Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type StripeItem = Stripe.ShoppingItem;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let raffles = Map.empty<Nat, Raffle>();
  let entries = Map.empty<Nat, Entry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextRaffleId = 1;
  var nextEntryId = 1;

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    let _ = caller;
    switch (stripeConfig) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func incrementRaffleId() : Nat {
    nextRaffleId += 1;
    nextRaffleId - 1;
  };

  func incrementEntryId() : Nat {
    nextEntryId += 1;
    nextEntryId - 1;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createRaffle(config : RaffleAdminConfig) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create raffles");
    };

    let id = incrementRaffleId();

    let raffle : Raffle = {
      id;
      title = config.title;
      description = config.description;
      spotPriceCents = config.spotPriceCents;
      totalSpots = config.totalSpots;
      prizeAmountCents = config.prizeAmountCents;
      drawTimestamp = config.drawTimestamp;
      videoUrl = config.videoUrl;
      status = #upcoming;
      winner = null;
      createdTime = Time.now();
      lastUpdated = Time.now();
      drawRecordId = null;
    };

    raffles.add(id, raffle);
    id;
  };

  public shared ({ caller }) func updateRaffle(id : Nat, config : RaffleAdminConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update raffles");
    };

    switch (raffles.get(id)) {
      case (null) { Runtime.trap("Raffle not found") };
      case (?existing) {
        switch (existing.status) {
          case (#drawn) { Runtime.trap("Raffle cannot be changed after draw"); };
          case (_) {
            let updated = {
              id;
              title = config.title;
              description = config.description;
              spotPriceCents = config.spotPriceCents;
              totalSpots = config.totalSpots;
              prizeAmountCents = config.prizeAmountCents;
              drawTimestamp = config.drawTimestamp;
              videoUrl = config.videoUrl;
              status = existing.status;
              winner = existing.winner;
              createdTime = existing.createdTime;
              lastUpdated = Time.now();
              drawRecordId = existing.drawRecordId;
            };
            raffles.add(id, updated);
          };
        };
      };
    };
  };

  public shared ({ caller }) func changeStatus(id : Nat, newStatus : RaffleStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change status");
    };

    let raffle = switch (raffles.get(id)) {
      case (null) { Runtime.trap("Raffle not found") };
      case (?r) { r };
    };
    raffles.add(
      id,
      {
        id = raffle.id;
        title = raffle.title;
        description = raffle.description;
        spotPriceCents = raffle.spotPriceCents;
        totalSpots = raffle.totalSpots;
        prizeAmountCents = raffle.prizeAmountCents;
        drawTimestamp = raffle.drawTimestamp;
        videoUrl = raffle.videoUrl;
        status = newStatus;
        winner = raffle.winner;
        createdTime = raffle.createdTime;
        lastUpdated = Time.now();
        drawRecordId = raffle.drawRecordId;
      },
    );
  };

  public shared ({ caller }) func purchaseEntries(buyerPid : Text, raffleId : Nat, quantity : Nat, _quantityConfirmed : Nat) : async () {
    // Verify that the caller is authorized to purchase entries
    // Either the caller must be the buyer themselves, or an admin
    let callerText = caller.toText();
    if (callerText != buyerPid and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only purchase entries for yourself");
    };

    switch (raffles.get(raffleId)) {
      case (null) { Runtime.trap("Raffle not found") };
      case (?raffle) {
        if (raffle.status != #open) {
          Runtime.trap("Raffle is not open for entries. Currently " # debug_show (raffle.status));
        };
        let currentEntries = getEntriesCountForRaffle(raffleId);
        if (quantity > (raffle.totalSpots - currentEntries)) {
          Runtime.trap("Too many entries requested. Only " # debug_show (raffle.totalSpots - currentEntries) # " spots left.");
        };
        let entryId = incrementEntryId();
        let entry : Entry = {
          id = entryId;
          raffleId;
          buyer = buyerPid;
          quantity;
          isPaid = true;
          purchaseTime = Time.now();
        };
        entries.add(entryId, entry);
      };
    };
  };

  public query ({ caller }) func getAllRaffles() : async [Raffle] {
    let _ = caller;
    raffles.values().toArray();
  };

  public query ({ caller }) func getActiveRaffles() : async [Raffle] {
    let _ = caller;
    raffles.values().toArray().filter(
      func(r) { r.status == #open and r.drawTimestamp > Time.now() }
    );
  };

  public query ({ caller }) func getEntries(raffleId : Nat) : async [Entry] {
    let _ = caller;
    entries.values().toArray().filter(
      func(e) { e.raffleId == raffleId }
    );
  };

  func getEntriesCountForRaffle(raffleId : Nat) : Nat {
    entries.values().toArray().filter(
      func(e) { e.raffleId == raffleId }
    ).size();
  };

  public query ({ caller }) func getRemainingSpots(raffleId : Nat) : async Nat {
    let _ = caller;
    switch (raffles.get(raffleId)) {
      case (null) { Runtime.trap("Raffle not found") };
      case (?raffle) {
        raffle.totalSpots - getEntriesCountForRaffle(raffleId);
      };
    };
  };

  public shared ({ caller }) func triggerDraw(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can trigger draws");
    };

    switch (raffles.get(id)) {
      case (null) { Runtime.trap("Raffle not found") };
      case (?raffle) {
        if (raffle.status != #open) {
          Runtime.trap("Raffle is not open for drawing");
        };

        let paidEntries = entries.values().toArray().filter(
          func(e) { e.raffleId == id and e.isPaid }
        );

        if (paidEntries.isEmpty()) {
          Runtime.trap("No entries to draw from. The draw can't be triggered.");
        };

        var winner : ?Text = null;
        let random = Random.crypto();

        for (entry in paidEntries.values()) {
          let isWinner = (await* random.bool()) and winner == null;
          if (isWinner) { winner := ?entry.buyer };
        };

        if (winner == null) {
          winner := ?(paidEntries[0].buyer);
        };

        let updatedRaffle = {
          id = raffle.id;
          title = raffle.title;
          description = raffle.description;
          spotPriceCents = raffle.spotPriceCents;
          totalSpots = raffle.totalSpots;
          prizeAmountCents = raffle.prizeAmountCents;
          drawTimestamp = raffle.drawTimestamp;
          videoUrl = raffle.videoUrl;
          status = #drawn;
          winner;
          createdTime = raffle.createdTime;
          lastUpdated = Time.now();
          drawRecordId = ?(raffle.id.toText() # "_" # Time.now().toText());
        };
        raffles.add(id, updatedRaffle);
      };
    };
  };

  public query ({ caller }) func getLiveRaffle(id : Nat) : async {
    raffle : Raffle;
    timeToDraw : Int;
    entries : [Entry];
  } {
    let _ = caller;
    let raffle = switch (raffles.get(id)) {
      case (null) { Runtime.trap("Raffle not found") };
      case (?value) { value };
    };

    let timeToDraw = raffle.drawTimestamp - Time.now();

    {
      raffle;
      timeToDraw;
      entries = entries.values().toArray().filter(
        func(e) { e.raffleId == id }
      );
    };
  };

  public query ({ caller }) func getCompletedRaffles() : async [{
    id : Nat;
    title : Text;
    drawTimestamp : Time.Time;
    winner : ?Text;
    participants : Nat;
    spotsSold : Nat;
  }] {
    let _ = caller;
    let completedRaffles = listingsToArray().filter(
      func(r) { r.status == #drawn }
    );

    completedRaffles.map(
      func(r) {
        {
          id = r.id;
          title = r.title;
          drawTimestamp = r.drawTimestamp;
          winner = r.winner;
          participants = getUniqueParticipantsCount(r.id);
          spotsSold = getEntriesCountForRaffle(r.id);
        };
      }
    );
  };

  func listingsToArray() : [Raffle] {
    raffles.values().toArray();
  };

  func getUniqueParticipantsCount(raffleId : Nat) : Nat {
    let raffleEntries = entries.values().toArray().filter(
      func(e) { e.raffleId == raffleId }
    );

    let participants = List.empty<Text>();
    for (entry in raffleEntries.values()) {
      if (not participants.any(func(existing) { existing == entry.buyer })) {
        participants.add(entry.buyer);
      };
    };
    participants.size();
  };
};
