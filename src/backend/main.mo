import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  // Persistent State
  let userConversations = Map.empty<Principal, Map.Map<Text, List.List<Message>>>();
  let pins = Map.empty<Principal, Text>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // Message type definition
  public type Message = {
    sender : Text;
    text : Text;
    timestamp : Nat64;
  };

  // Get caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Get another user's profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to get or create user's conversation map
  func getUserConversationMap(user : Principal) : Map.Map<Text, List.List<Message>> {
    switch (userConversations.get(user)) {
      case (null) {
        let newMap = Map.empty<Text, List.List<Message>>();
        userConversations.add(user, newMap);
        newMap;
      };
      case (?existingMap) { existingMap };
    };
  };

  // Add message to a conversation
  public shared ({ caller }) func addMessage(conversationId : Text, message : Message) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add messages");
    };

    let conversations = getUserConversationMap(caller);
    switch (conversations.get(conversationId)) {
      case (null) {
        Runtime.trap("Conversation does not exist");
      };
      case (?messages) {
        messages.add(message);
      };
    };
  };

  // Add new conversation
  public shared ({ caller }) func addConversation(conversationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create conversations");
    };

    let conversations = getUserConversationMap(caller);
    if (conversations.containsKey(conversationId)) {
      Runtime.trap("Conversation already exists.");
    };
    conversations.add(conversationId, List.empty<Message>());
  };

  // Get messages from a conversation
  public query ({ caller }) func getMessages(conversationId : Text) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    switch (userConversations.get(caller)) {
      case (null) { Runtime.trap("Conversation does not exist") };
      case (?conversations) {
        switch (conversations.get(conversationId)) {
          case (null) { Runtime.trap("Conversation does not exist") };
          case (?messages) { messages.toArray() };
        };
      };
    };
  };

  // Get all conversation IDs
  public query ({ caller }) func getConversations() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list conversations");
    };

    switch (userConversations.get(caller)) {
      case (null) { [] };
      case (?conversations) { conversations.keys().toArray() };
    };
  };

  // Set PIN
  public shared ({ caller }) func setPin(pin : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set a PIN");
    };

    // Check if PIN has a valid format (length and digits only)
    if (pin.size() < 4 or pin.size() > 6) {
      Runtime.trap("PIN must be between 4-6 characters long");
    };
    if (not isDigitsOnly(pin)) {
      Runtime.trap("PIN must contain only digits (0-9)");
    };

    pins.add(caller, pin);
  };

  // Check PIN
  public shared ({ caller }) func checkPin(pin : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check a PIN");
    };

    switch (pins.get(caller)) {
      case (null) {
        Runtime.trap("PIN not set for this user.");
      };
      case (?storedPin) {
        if (pin == storedPin) { true } else {
          false;
        };
      };
    };
  };

  // Helper function to check if a string contains only digits
  func isDigitsOnly(text : Text) : Bool {
    let chars = text.toArray();
    let digitChars = "0123456789".toArray();
    for (char in chars.values()) {
      var isDigit = false;
      for (dc in digitChars.values()) {
        if (char == dc) { isDigit := true };
      };
      if (not isDigit) {
        return false;
      };
    };
    true;
  };
};
