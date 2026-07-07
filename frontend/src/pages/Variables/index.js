import React, { useState } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import { Chip, Tooltip } from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import { Variable, Copy } from "lucide-react";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  varChip: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    color: "#fff",
    fontWeight: 500,
  },
}));

const msgVars = [
  { name: i18n.t("messageVariablesPicker.vars.contactFirstName"), value: "{{firstName}}" },
  { name: i18n.t("messageVariablesPicker.vars.contactName"), value: "{{name}}" },
  { name: i18n.t("messageVariablesPicker.vars.user"), value: "{{userName}}" },
  { name: i18n.t("messageVariablesPicker.vars.greeting"), value: "{{ms}}" },
  { name: i18n.t("messageVariablesPicker.vars.protocolNumber"), value: "{{protocol}}" },
  { name: i18n.t("messageVariablesPicker.vars.date"), value: "{{date}}" },
  { name: i18n.t("messageVariablesPicker.vars.hour"), value: "{{hour}}" },
  { name: i18n.t("messageVariablesPicker.vars.ticket_id"), value: "{{ticket_id}}" },
  { name: i18n.t("messageVariablesPicker.vars.queue"), value: "{{queue}}" },
  { name: i18n.t("messageVariablesPicker.vars.connection"), value: "{{connection}}" },
];

const Variables = () => {
  const classes = useStyles();

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    toast.success(i18n.t("messageVariablesPicker.copied"));
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          {i18n.t("messageVariablesPicker.title")} ({msgVars.length})
        </Title>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="left">
                {i18n.t("messageVariablesPicker.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("messageVariablesPicker.table.variable")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("messageVariablesPicker.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {msgVars.map((item, index) => (
              <TableRow key={item.value}>
                <TableCell align="center">{index + 1}</TableCell>

                <TableCell align="left">{item.name}</TableCell>

                <TableCell align="center">
                  <Chip
                    label={item.value}
                    size="small"
                    className={classes.varChip}
                  />
                </TableCell>

                <TableCell align="center">
                  <Tooltip title={i18n.t("messageVariablesPicker.copy")}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(item.value)}
                    >
                      <Copy size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Variables;
