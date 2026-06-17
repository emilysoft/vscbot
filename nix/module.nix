{self, ...}: {
  config,
  pkgs,
  lib,
  ...
}: let
  cfg = config.services.vscbot;
in {
  options.services.vscbot = {
    enable = lib.mkEnableOption "vscbot Discord bot service";

    package = lib.mkOption {
      type = lib.types.package;
      default = self.packages.${pkgs.system}.default;
      description = "The vscbot package to execute.";
    };

    tokenFile = lib.mkOption {
      type = lib.types.path;
      description = "Path to an environment file containing secrets (e.g., DISCORD_TOKEN).";
    };

    dataDir = lib.mkOption {
      type = lib.types.str;
      default = "vscbot";
      description = "The name of the state directory under /var/lib where the bot stores its database.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3000;
      description = "API port";
    };

    mainServerId = lib.mkOption {
      type = lib.types.str;
      description = "main server id";
    };

    clientId = lib.mkOption {
      type = lib.types.str;
      description = "client id";
    };
  };

  config = lib.mkIf cfg.enable {
    users.users.vscbot = {
      isSystemUser = true;
      group = "vscbot";
    };
    users.groups.vscbot = {};

    systemd.services.vscbot = {
      description = "vscbot Discord Bot Service";
      after = ["network.target"];
      wantedBy = ["multi-user.target"];
      environment = {
        DATABASE_DIR = "/var/lib/${cfg.dataDir}";
        CUSTOM_ICONS_DIR = "/var/lib/${cfg.dataDir}/custom_roles/";
        API_PORT = toString cfg.port;
        MAIN_SERVER = cfg.mainServerId;
        CLIENT_ID = cfg.clientId;
      };
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/vscbot";
        Restart = "on-failure";
        RestartSec = 5;
        User = "vscbot";
        Group = "vscbot";
        StateDirectory = [
          "${cfg.dataDir}"
          "${cfg.dataDir}/custom_roles"
        ];
        EnvironmentFile = cfg.tokenFile;
        ProtectSystem = "strict";
        ProtectHome = true;
        NoNewPrivileges = true;
        PrivateTmp = true;
        ReadWritePaths = [
          "/var/lib/${cfg.dataDir}"
          "/var/lib/${cfg.dataDir}/custom_roles"
        ];
      };
    };
  };
}
